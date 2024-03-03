import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentService, Transaction } from '@ride-spark/payment';
import { User } from '@ride-spark/user';
import { WompiService } from '@ride-spark/wompi';
import { Point } from 'geojson';
import { Repository } from 'typeorm';
import { CreateRideDto } from './dto/create-ride.dto';
import { Ride } from './entities';
import { CreatePaymentDto } from '@ride-spark/payment/dto/create-payment.dto';
import { CreatePaymentSourceDto, FinishRideDto } from './dto';

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
    @InjectRepository(Ride)
    private rideRepository: Repository<Ride>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>
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

  private async validateRider(passengerId: number): Promise<User> {
    const rider = await this.userRepository.findOne({
      where: { id: passengerId, type: 'rider' },
    });
    if (!rider) {
      throw new NotFoundException('Rider not found');
    }
    return rider;
  }

  private async checkInProgressRide(rider: User): Promise<void> {
    const inProgressRide = await this.rideRepository.findOne({
      where: { passenger: rider, status: 'in_progress' },
    });
    if (inProgressRide) {
      throw new BadRequestException('The rider already has a ride in progress');
    }
  }

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

    console.log('Transaction result:', transactionResult);

    await this.recordTransaction(ride, totalCharged, transactionResult);

    await this.rideRepository.save(ride);

    return ride;
  }

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

  private async getRider(riderId: number): Promise<User> {
    const rider = await this.userRepository.findOne({
      where: { id: riderId, type: 'rider' },
    });
    if (!rider) {
      throw new NotFoundException('Rider not found');
    }
    return rider;
  }

  private async validateRiderPaymentSource(riderId: number) {
    console.log('Rider ID:', riderId);
    const paymentSource = await this.paymentService.findByUserId(riderId);
    if (!paymentSource) {
      throw new NotFoundException('Payment source not found for the rider');
    }
    console.log('Payment source:', paymentSource);
    return paymentSource;
  }

  private async processPayment(
    totalCharged: number,
    rider: User,
    rideId: number,
    paymentSource: any
  ) {
    return await this.wompiService.charge(
      totalCharged,
      rider.email,
      `RIDE-${rideId}`,
      paymentSource.payment_source_id.toString()
    );
  }

  private async recordTransaction(
    ride: Ride,
    totalCharged: number,
    transactionResult: any
  ) {
    const transaction = new Transaction();
    transaction.ride_id = ride.id;
    transaction.user_id = ride.passenger.id;
    transaction.amount = totalCharged;
    transaction.status = transactionResult?.data?.id ? 'successful' : 'failed';
    transaction.wompi_transaction_id = transactionResult?.data
      ? transactionResult.data.id
      : '';
    await this.transactionRepository.save(transaction);
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

    const distance = this.calculateDistance(ride.start_location, endLocation); // distancia en km

    const duration =
      (ride.end_time.getTime() - ride.start_time.getTime()) / 60000;

    const totalCharge =
      BASE_FEE + distance * PRICE_PER_KM + duration * PRICE_PER_MINUTE;

    const roundedTotalCharge = Math.round(totalCharge);

    return roundedTotalCharge;
  }

  /**
   * Calculates the distance between two points using the Haversine formula.
   * @param startLocation - The starting point coordinates.
   * @param endLocation - The ending point coordinates.
   * @returns The distance between the two points in kilometers.
   */
  private calculateDistance(startLocation: Point, endLocation: Point): number {
    const latitude1 = startLocation.coordinates[1];
    const longitude1 = startLocation.coordinates[0];
    const latitude2 = endLocation.coordinates[1];
    const longitude2 = endLocation.coordinates[0];

    const radLatitude1 = this.degreesToRadians(latitude1);
    const radLongitude1 = this.degreesToRadians(longitude1);
    const radLatitude2 = this.degreesToRadians(latitude2);
    const radLongitude2 = this.degreesToRadians(longitude2);

    const dLat = radLatitude2 - radLatitude1;
    const dLon = radLongitude2 - radLongitude1;

    // Haversine
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(radLatitude1) *
        Math.cos(radLatitude2) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = 6371 * c;

    const roundedDistance = Math.round(distance * 100) / 100;
    return roundedDistance;
  }

  /**
   * Converts degrees to radians.
   * @param degrees - The value in degrees to be converted.
   * @returns The value in radians.
   */
  private degreesToRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}
