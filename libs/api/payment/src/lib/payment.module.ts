import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentMethod, Transaction } from './entities';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { WompiModule } from '@ride-spark/wompi';

@Module({
  imports: [
    WompiModule,
    TypeOrmModule.forFeature([PaymentMethod, Transaction]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
