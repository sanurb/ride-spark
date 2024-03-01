import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentModule } from '@ride-spark/payment';
import { User } from '@ride-spark/user';
import { WompiModule } from '@ride-spark/wompi';
import { AvailableRide, Ride } from './entities';
import { RideController } from './ride.controller';
import { RideService } from './ride.service';

@Module({
  controllers: [RideController],
  providers: [RideService],
  imports: [
    WompiModule,
    PaymentModule,
    TypeOrmModule.forFeature([AvailableRide, Ride, User]),
  ],
  exports: [RideService],
})
export class RideModule {}
