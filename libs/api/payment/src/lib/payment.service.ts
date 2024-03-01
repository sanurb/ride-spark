import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentMethod } from './entities';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentService {

  constructor(
    @InjectRepository(PaymentMethod)
    private paymentRepository: Repository<PaymentMethod>,
  ) {}

  async create(paymentBody: CreatePaymentDto) {
    return await this.paymentRepository.save(paymentBody);
  }
}

