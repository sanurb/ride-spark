import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentModule, Transaction } from '@ride-spark/payment';
import { User } from '@ride-spark/user';
import { WompiModule } from '@ride-spark/wompi';
import { Ride } from './entities/ride.entity';
import { RideController } from './ride.controller';
import { RideService } from './ride.service';

@Module({
  controllers: [RideController],
  providers: [RideService],
  imports: [
    WompiModule,
    PaymentModule,
    TypeOrmModule.forFeature([Ride, User, Transaction]),
  ],
  exports: [RideService],
})
export class RideModule {}
