import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Ride } from '@ride-spark/ride';
import { Repository } from 'typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentMethod, Transaction } from './entities';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(PaymentMethod)
    private paymentRepository: Repository<PaymentMethod>,

    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>
  ) {}

  async create(paymentBody: CreatePaymentDto) {
    return await this.paymentRepository.save(paymentBody);
  }

  async findAll() {
    return await this.paymentRepository.find();
  }

  async findByUserId(userId: number): Promise<PaymentMethod | null> {
    return await this.paymentRepository.findOne({
      where: { user: { id: userId } }
    });
  }

  async findDefaultMethodByUserId(
    userId: number
  ): Promise<PaymentMethod | null> {
    return this.paymentRepository.findOne({
      where: { user: { id: userId }, default_method: true },
    });
  }

  /**
   * Records a transaction for a ride.
   *
   * @param ride - The ride object.
   * @param totalCharged - The total amount charged for the ride.
   * @param transactionResult - The result of the transaction.
   */
  @OnEvent('ride.finished')
  async handleRideFinished(ride: Ride, totalCharged: number, transactionResult: any) {
    const transaction = new Transaction();
    transaction.ride_id = ride.id;
    transaction.user_id = ride.passenger.id;
    transaction.amount = totalCharged;
    transaction.status = transactionResult?.data?.id ? 'successful' : 'failed';
    transaction.wompi_transaction_id = transactionResult?.data?.id ?? '';

    await this.transactionRepository.save(transaction);
}
}
