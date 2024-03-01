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
import { CreatePaymentSourceDto } from './dto';

@Injectable()
export class RideService {
  @Inject(WompiService)
  private readonly wompiService: WompiService;

  @Inject(PaymentService)
  private readonly paymentService: PaymentService;

  private readonly token = 'tok_test_10967_e6e71777457aF8Af1541df04cc928466';

  constructor(
    @InjectRepository(Ride)
    private rideRepository: Repository<Ride>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>
  ) {}

  async createRide(createRideDto: CreateRideDto): Promise<Ride> {
    const rider = await this.userRepository.findOne({
      where: { id: createRideDto.passenger_id, type: 'rider' },
    });

    if (!rider) {
      throw new NotFoundException('Rider not found');
    }

    await this.ensurePaymentSource(rider);

    const nearestDriver = await this.findNearestDriver(
      createRideDto.start_location
    );
    if (!nearestDriver) {
      throw new NotFoundException('No available drivers found');
    }

    const newRide = this.rideRepository.create({
      ...createRideDto,
      driver_id: nearestDriver.id,
      status: 'in_progress',
      start_time: new Date(),
    });

    const savedRide = await this.rideRepository.save(newRide);

    return {
      ...savedRide,
    };
  }

  private async findNearestDriver(startLocation: Point): Promise<User | null> {
    const startLocationPoint = `SRID=4326;POINT(${startLocation.coordinates[0]} ${startLocation.coordinates[1]})`;

    const query = `
      SELECT *, ST_Distance(location::geography, ST_GeomFromText('${startLocationPoint}', 4326)::geography) AS distance
      FROM "users"
      WHERE type = 'driver' AND location IS NOT NULL
      ORDER BY location <-> ST_SetSRID(ST_MakePoint(${startLocation.coordinates[0]}, ${startLocation.coordinates[1]}), 4326)
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

  async ensurePaymentSource(rider: User): Promise<void> {
    if (!rider.paymentMethods?.length || rider.paymentMethods?.length === 0) {
      const acceptanceTokenResult = await this.wompiService.merchant();

      const acceptanceToken =
        acceptanceTokenResult.data.presigned_acceptance.acceptance_token;

      const paymentSourceResult = await this.wompiService.paymentSources(
        'CARD',
        this.token,
        rider.email,
        acceptanceToken
      );

        const paymentBody: CreatePaymentDto = {
          user_id: rider.id,
          wompi_token: paymentSourceResult?.token ?? this.token,
          payment_source_id: paymentSourceResult?.id ?? 11306,
          type: 'CARD',
          default_method: true,
        }

      await this.paymentService.create(paymentBody)
    }
  }

  async createPaymentSource(createPaymentSourceDto: CreatePaymentSourceDto) {
    const { rider_id, acceptance_token } = createPaymentSourceDto;

    const rider = await this.userRepository.findOne({ where: { id: rider_id } });
    if (!rider) {
      throw new NotFoundException('Rider not found');
    }

    const paymentSourceResult = await this.wompiService.paymentSources(
      'CARD',
      this.token,
      rider.email,
      acceptance_token
    );

    if (paymentSourceResult && paymentSourceResult.data && paymentSourceResult.data.id) {
      return await this.paymentService.create({
        user_id: rider.id,
        wompi_token: this.token,
        payment_source_id: paymentSourceResult?.data?.id ?? 11306,
        type: 'CARD',
        default_method: true,
      });
    } else {
      throw new InternalServerErrorException('Failed to create payment source');
    }
  }

  async getRideById(rideId: number): Promise<Ride> {
    return await this.rideRepository.findOneByOrFail({ id: rideId });
}

  async finishRide(rideId: number, finalLocation: Point): Promise<Ride> {
    const ride = await this.getRideById(rideId);
    if (!ride) {
      throw new NotFoundException(`Ride not found or it's not in progress`);
    }

    console.log('Ride:', ride.passenger_id);

    ride.end_location = finalLocation;
    ride.end_time = new Date();
    ride.status = 'finished';

    const totalCharged = this.calculateTotalCharge(ride, finalLocation);
    if (totalCharged <= 0) {
      throw new BadRequestException('Invalid total charge calculated');
    }

    const paymentSource = await this.paymentService.findByUserId(ride.passenger_id);
    if (!paymentSource) {
      throw new NotFoundException('Payment source not found for the rider');
    }

    const rider = await this.userRepository.findOne({ where: { id: ride.passenger_id } });
    if (!rider) {
      throw new NotFoundException('Rider not found');
    }

    const transactionResult: any = await this.wompiService.charge(
      totalCharged,
      rider.email,
      `RIDE-${rideId}`,
      paymentSource.payment_source_id.toString()
    );

    console.log('Transaction result:', transactionResult);

    const transaction = new Transaction();
    transaction.ride_id = ride.driver_id ?? 0;
    transaction.user_id = ride.passenger_id;
    transaction.amount = totalCharged;
    transaction.status = transactionResult?.data?.id ? 'successful' : 'failed';
    transaction.wompi_transaction_id = transactionResult?.data ? transactionResult.data.id : ''; // Ajusta según la respuesta de Wompi

    await this.transactionRepository.save(transaction);

    await this.rideRepository.save(ride);

    return ride;
  }

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

  private degreesToRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}
