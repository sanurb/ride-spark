import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentService } from '@ride-spark/payment';
import { CreatePaymentDto } from '@ride-spark/payment/dto/create-payment.dto';
import { User } from '@ride-spark/user';
import { WompiService } from '@ride-spark/wompi';
import { Point } from 'geojson';
import { Repository } from 'typeorm';
import { CreatePaymentSourceDto, FinishRideDto } from './dto';
import { CreateRideDto } from './dto/create-ride.dto';
import { Ride } from './entities';
import { calculateDistance } from './utils';
import { v4 as uuidv4 } from 'uuid';
/**
 * Service responsible for handling ride-related operations.
 */
@Injectable()
export class RideService {
  @Inject(WompiService)
  private readonly wompiService: WompiService;

  @Inject(PaymentService)
  private readonly paymentService: PaymentService;

  constructor(
    private readonly eventEmitter: EventEmitter2,

    @InjectRepository(Ride)
    private rideRepository: Repository<Ride>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Creates a new ride based on the provided ride data.
   *
   * @param createRideDto - The data for creating a new ride.
   * @returns A Promise that resolves to the created ride.
   * @throws NotFoundException if the rider or available drivers are not found.
   */
  async createRide(createRideDto: CreateRideDto): Promise<Ride> {
    this.validateLocations(
      createRideDto.start_location,
      createRideDto.end_location
    );

    const rider = await this.validateRider(createRideDto.passenger_id);
    await this.checkInProgressRide(rider);

    const nearestDriver = await this.findNearestDriver(
      createRideDto.start_location
    );
    if (!nearestDriver) {
      throw new NotFoundException('No available drivers found');
    }

    return this.saveNewRide(createRideDto, rider, nearestDriver);
  }

  /**
   * Validates the start and end locations for a ride.
   * Throws a BadRequestException if the start and end locations are the same.
   *
   * @param startCoordinates - The coordinates of the start location.
   * @param endCoordinates - The coordinates of the end location.
   */
  private validateLocations(
    startCoordinates: [number, number],
    endCoordinates: [number, number]
  ): void {
    const startLocation: Point = {
      type: 'Point',
      coordinates: startCoordinates,
    };
    const endLocation: Point = { type: 'Point', coordinates: endCoordinates };

    if (
      startLocation.coordinates[0] === endLocation.coordinates[0] &&
      startLocation.coordinates[1] === endLocation.coordinates[1]
    ) {
      throw new BadRequestException(
        'The start and end locations cannot be the same'
      );
    }
  }

  /**
   * Validates a rider by checking if the rider exists in the database.
   * @param passengerId - The ID of the rider to validate.
   * @returns A Promise that resolves to the validated rider.
   * @throws NotFoundException if the rider is not found.
   */
  private async validateRider(passengerId: number): Promise<User> {
    const rider = await this.userRepository.findOne({
      where: { id: passengerId, type: 'rider' },
    });
    if (!rider) {
      throw new NotFoundException('Rider not found');
    }
    return rider;
  }

  /**
   * Checks if the given rider has an in-progress ride.
   * Throws a BadRequestException if the rider already has a ride in progress.
   *
   * @param rider - The rider to check for in-progress ride.
   * @returns A Promise that resolves to void.
   */
  private async checkInProgressRide(rider: User): Promise<void> {
    const inProgressRide = await this.rideRepository.findOne({
      where: { passenger: rider, status: 'in_progress' },
    });
    if (inProgressRide) {
      throw new BadRequestException('The rider already has a ride in progress');
    }
  }

  /**
   * Saves a new ride in the database.
   *
   * @param createRideDto - The DTO containing the details of the ride to be created.
   * @param rider - The user who requested the ride.
   * @param driver - The user who will be driving the ride.
   * @returns A Promise that resolves to the newly created Ride object.
   */
  private async saveNewRide(
    createRideDto: CreateRideDto,
    rider: User,
    driver: User
  ): Promise<Ride> {
    const startLocationPoint: Point = {
      type: 'Point',
      coordinates: createRideDto.start_location,
    };

    const endLocationPoint: Point = {
      type: 'Point',
      coordinates: createRideDto.end_location,
    };

    const newRide = this.rideRepository.create({
      ...createRideDto,
      passenger: rider,
      driver: driver,
      status: 'in_progress',
      start_time: new Date(),
      start_location: startLocationPoint,
      end_location: endLocationPoint,
    });

    this.eventEmitter.emit('ride.created', newRide);
    return await this.rideRepository.save(newRide);
  }

  /**
   * Finds the nearest driver to the specified start location.
   *
   * @param startLocation - The start location coordinates.
   * @returns A Promise that resolves to the nearest driver User object, or null if no driver is found.
   */
  private async findNearestDriver(
    startCoordinates: [number, number]
  ): Promise<User | null> {
    const startLocationPoint = `SRID=4326;POINT(${startCoordinates[0]} ${startCoordinates[1]})`;

    const query = `
        SELECT *, ST_Distance(location::geography, ST_GeomFromText('${startLocationPoint}', 4326)::geography) AS distance
        FROM "users"
        WHERE type = 'driver' AND location IS NOT NULL
        ORDER BY location <-> ST_SetSRID(ST_MakePoint(${startCoordinates[0]}, ${startCoordinates[1]}), 4326)
        LIMIT 1;
    `;

    try {
      const result = await this.userRepository.query(query);
      if (result.length > 0) {
        return result[0];
      }
      return null;
    } catch (error) {
      console.error('Error finding nearest driver:', error);
      return null;
    }
  }

  /**
   * Ensures that the rider has a payment source.
   * If the rider does not have any payment methods, it creates a payment source for the rider.
   * @param rider - The rider for whom to ensure the payment source.
   * @returns A Promise that resolves to void.
   */
  async ensurePaymentSource(rider: User): Promise<void> {
    if (!rider.paymentMethods?.length || rider.paymentMethods?.length === 0) {
      const acceptanceTokenResult = await this.wompiService.merchant();

      const acceptanceToken =
        acceptanceTokenResult.data.presigned_acceptance.acceptance_token;

      // Add a new card for the rider if they don't have any payment methods
      // this is done to avoid validation error "The token is already in use".
      const newTokenizedCard = await this.wompiService.addCard();

      // Create a payment source for the rider
      const paymentSourceResult = await this.wompiService.paymentSources(
        'CARD',
        newTokenizedCard?.data?.id,
        rider.email,
        acceptanceToken
      );

      const paymentBody: CreatePaymentDto = {
        user_id: rider.id,
        wompi_token: paymentSourceResult?.data?.token,
        payment_source_id: paymentSourceResult?.data?.id,
        type: 'CARD',
        default_method: true,
      };

      await this.paymentService.create(paymentBody);
    }
  }

  /**
   * Creates a payment source for a rider.
   *
   * @param createPaymentSourceDto - The DTO containing the necessary information to create a payment source.
   * @returns A Promise that resolves to the created payment source.
   * @throws NotFoundException if the rider is not found.
   * @throws InternalServerErrorException if the payment source creation fails.
   */
  async createPaymentSource(createPaymentSourceDto: CreatePaymentSourceDto) {
    const { rider_id, acceptance_token } = createPaymentSourceDto;

    const rider = await this.userRepository.findOne({
      where: { id: rider_id },
    });
    if (!rider) {
      throw new NotFoundException('Rider not found');
    }

    const defaultPaymentMethod =
      await this.paymentService.findDefaultMethodByUserId(rider_id);

    const backupPaymentMethod = defaultPaymentMethod
      ? null
      : await this.paymentService.findDefaultMethodByUserId(1);

    const wompiToken =
      defaultPaymentMethod?.wompi_token ?? backupPaymentMethod?.wompi_token;
    const paymentSourceId =
      defaultPaymentMethod?.payment_source_id ??
      backupPaymentMethod?.payment_source_id;

    if (!wompiToken || !paymentSourceId) {
      throw new InternalServerErrorException('No valid payment source found');
    }

    const paymentSourceResult = await this.wompiService.paymentSources(
      'CARD',
      wompiToken,
      rider.email,
      acceptance_token
    );

    if (
      paymentSourceResult &&
      paymentSourceResult.data &&
      paymentSourceResult.data.id
    ) {
      return await this.paymentService.create({
        user_id: rider.id,
        wompi_token: wompiToken,
        payment_source_id: paymentSourceResult.data.id,
        type: 'CARD',
        default_method: true,
      });
    } else {
      throw new InternalServerErrorException('Failed to create payment source');
    }
  }

  /**
   * Finds a ride by its ID.
   *
   * @param rideId - The ID of the ride to find.
   * @returns A Promise that resolves to the found ride.
   * @throws NotFoundException if the ride with the specified ID is not found.
   */
  async findById(rideId: number): Promise<Ride> {
    const ride = await this.rideRepository.findOne({ where: { id: rideId } });
    if (!ride) {
      throw new NotFoundException('Ride not found');
    }
    return ride;
  }

  /**
   * Retrieves a ride by its ID.
   *
   * @param rideId - The ID of the ride to retrieve.
   * @returns A Promise that resolves to the retrieved Ride object.
   */
  async getRideById(rideId: number): Promise<Ride | null> {
    return await this.rideRepository.findOne({ where: { id: rideId } });
  }

  /**
   * Finishes a ride by updating the ride details, calculating the total charge,
   * charging the passenger, and saving the transaction and ride information.
   *
   * @param rideId - The ID of the ride to finish.
   * @param finalLocation - The final location of the ride.
   * @returns A Promise that resolves to the updated Ride object.
   * @throws NotFoundException if the ride is not found or not in progress.
   * @throws BadRequestException if the total charge calculated is invalid.
   * @throws NotFoundException if the payment source is not found for the rider.
   * @throws NotFoundException if the rider is not found.
   */
  async finishRide(
    rideId: number,
    finishRideDto: FinishRideDto
  ): Promise<Ride> {
    const ride = await this.getRideById(rideId);
    if (!ride || ride.status !== 'in_progress') {
      throw new NotFoundException(`Ride not found or it's not in progress`);
    }

    const finalLocationPoint: Point = {
      type: 'Point',
      coordinates: finishRideDto.finalLocation,
    };

    ride.end_time = new Date();
    const totalCharged = this.calculateTotalCharge(ride, finalLocationPoint);
    this.validateTotalCharge(totalCharged);

    this.updateRideEndDetails(ride, finalLocationPoint, totalCharged);

    const rider = await this.getRider(ride.passenger.id);
    const paymentSource = await this.validateRiderPaymentSource(
      ride.passenger.id
    );

    const transactionResult = await this.processPayment(
      totalCharged,
      rider,
      rideId,
      paymentSource
    );

    this.eventEmitter.emit('ride.finished', ride, totalCharged, transactionResult);
    await this.rideRepository.save(ride);

    return ride;
  }

  /**
   * Updates the end details of a ride.
   *
   * @param ride - The ride object to update.
   * @param finalLocation - The final location of the ride.
   * @param totalCharged - The total amount charged for the ride.
   */
  private updateRideEndDetails(
    ride: Ride,
    finalLocation: Point,
    totalCharged: number
  ) {
    ride.end_location = finalLocation;
    ride.status = 'finished';
    ride.total_charged = totalCharged;
  }

  private validateTotalCharge(totalCharged: number) {
    if (totalCharged <= 0) {
      throw new BadRequestException('Invalid total charge calculated');
    }
  }

  /**
   * Retrieves a rider by their ID.
   * @param riderId - The ID of the rider to retrieve.
   * @returns A Promise that resolves to the retrieved rider.
   * @throws NotFoundException if the rider is not found.
   */
  private async getRider(riderId: number): Promise<User> {
    const rider = await this.userRepository.findOne({
      where: { id: riderId, type: 'rider' },
    });
    if (!rider) {
      throw new NotFoundException('Rider not found');
    }
    return rider;
  }

  /**
   * Validates the payment source for a rider.
   * @param riderId - The ID of the rider.
   * @returns The payment source for the rider.
   * @throws NotFoundException if the payment source is not found for the rider.
   */
  private async validateRiderPaymentSource(riderId: number) {
    const paymentSource = await this.paymentService.findByUserId(riderId);
    if (!paymentSource) {
      throw new NotFoundException('Payment source not found for the rider');
    }
    return paymentSource;
  }

  /**
   * Process the payment for a ride.
   *
   * @param totalCharged - The total amount to be charged for the ride.
   * @param rider - The user who is taking the ride.
   * @param rideId - The ID of the ride.
   * @param paymentSource - The payment source information.
   * @returns A promise that resolves to the result of the payment processing.
   */
  private async processPayment(
    totalCharged: number,
    rider: User,
    rideId: number,
    paymentSource: any
  ) {
    const uniqueRef = `RIDE-${rideId}-${uuidv4()}`;

    return await this.wompiService.charge(
      totalCharged,
      rider.email,
      uniqueRef,
      paymentSource.payment_source_id.toString()
    );
  }

  /**
   * Calculates the total charge for a ride based on the ride details and the end location.
   * @param ride - The ride object containing the start and end time.
   * @param endLocation - The end location of the ride.
   * @returns The total charge for the ride.
   * @throws BadRequestException if the ride does not have a start or end time.
   */
  private calculateTotalCharge(ride: Ride, endLocation: Point): number {
    if (!ride.start_time || !ride.end_time) {
      throw new BadRequestException(
        'The ride must have a start and end time to calculate the total charge'
      );
    }

    const BASE_FEE = 3500;
    const PRICE_PER_KM = 1000;
    const PRICE_PER_MINUTE = 200;

    const distance = calculateDistance(ride.start_location, endLocation); // distancia en km

    const duration =
      (ride.end_time.getTime() - ride.start_time.getTime()) / 60000;

    const totalCharge =
      BASE_FEE + distance * PRICE_PER_KM + duration * PRICE_PER_MINUTE;

    const roundedTotalCharge = Math.round(totalCharge);

    return roundedTotalCharge;
  }
}
