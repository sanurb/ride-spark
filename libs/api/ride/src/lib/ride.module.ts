import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvailableRide, Ride } from './entities';
import { RideController } from './ride.controller';
import { RideService } from './ride.service';

@Module({
  controllers: [RideController],
  providers: [RideService],
  imports: [
    TypeOrmModule.forFeature([AvailableRide, Ride]),
  ],
  exports: [RideService],
})
export class RideModule {}
