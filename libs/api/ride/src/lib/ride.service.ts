import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@ride-spark/user';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { CreateRideDto } from './dto/create-ride.dto';
import { Ride } from './entities';
import { Point } from 'geojson';

@Injectable()
export class RideService {
  constructor(
    @InjectRepository(Ride)
    private rideRepository: Repository<Ride>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async createRide(createRideDto: CreateRideDto): Promise<Ride> {
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

  async finishRide(rideId: number, finalLocation: Point): Promise<Ride> {
    const ride = await this.rideRepository.findOne({
      where: { id: rideId, status: 'in_progress' },
    });

    if (!ride) {
      throw new NotFoundException(
        `Ride not found or you're not assigned to this ride`
      );
    }

    // validar si el final es distinto al inicial
    if (
      ride.start_location.coordinates[0] === finalLocation.coordinates[0] &&
      ride.start_location.coordinates[1] === finalLocation.coordinates[1]
    ) {
      throw new BadRequestException(
        'The final location must be different from the start location'
      );
    }

    const rideClone = { ...ride };
    rideClone.end_time = new Date();
    rideClone.status = 'finished';

    const totalCharged = this.calculateTotalCharge(rideClone, finalLocation);
    rideClone.total_charged = Math.max(totalCharged, 0);

    const transactionResult = await this.processPaymentThroughWompi(
      totalCharged
    );

    if (transactionResult.success) {
      rideClone.status = 'finished';
      rideClone.total_charged = totalCharged;
      rideClone.end_location = finalLocation;
      await this.rideRepository.save(rideClone);

      return rideClone;
    } else {
      throw new BadRequestException('Payment processing failed');
    }
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

    return totalCharge;
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
    console.log('Distance:', roundedDistance);
    return roundedDistance
  }

  private degreesToRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  private async processPaymentThroughWompi(
    totalCharged: number
  ): Promise<{ success: boolean }> {
    // Simula una llamada al API de Wompi para procesar el pago
    return { success: true }; // Retorna el resultado simulado
  }
}
