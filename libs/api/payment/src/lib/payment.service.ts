import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentMethod } from './entities';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(PaymentMethod)
    private paymentRepository: Repository<PaymentMethod>
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
}
