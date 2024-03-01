import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@ride-spark/user';
import { AvailableRide, Ride } from './entities';
import { RideController } from './ride.controller';
import { RideService } from './ride.service';

@Module({
  controllers: [RideController],
  providers: [RideService],
  imports: [
    TypeOrmModule.forFeature([AvailableRide, Ride, User]),
  ],
  exports: [RideService],
})
export class RideModule {}
