import { BadRequestException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Ride } from '@ride-spark/ride';
import { WompiService } from '@ride-spark/wompi';
import { Repository } from 'typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentMethod, Transaction } from './entities';
import { User } from '@ride-spark/user';

@Injectable()
export class PaymentService {
  @Inject(WompiService)
  private readonly wompiService: WompiService;

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
      where: { user: { id: userId } },
    });
  }

  async findDefaultMethodByUserId(
    userId: number
  ): Promise<PaymentMethod | null> {
    return this.paymentRepository.findOne({
      where: { user: { id: userId }, default_method: true },
    });
  }

  private async getAcceptanceToken(): Promise<string> {
    const acceptanceTokenResult = await this.wompiService.merchant();
    return acceptanceTokenResult.data.presigned_acceptance.acceptance_token;
  }

  private async getTokenizedCard(): Promise<{ token: string }> {
    const newTokenizedCard = await this.wompiService.addCard();
    if (!newTokenizedCard?.data?.id) {
      throw new Error('Failed to tokenize new card');
    }
    return { token: newTokenizedCard.data.id };
  }

  private async createPaymentSource(tokenizedCardId: string, email: string, acceptanceToken: string): Promise<{ id: string; token: string }> {
    const paymentSourceResult = await this.wompiService.paymentSources(
      'CARD',
      tokenizedCardId,
      email,
      acceptanceToken
    );
    if (!paymentSourceResult.data.id || !paymentSourceResult.data.token) {
      throw new InternalServerErrorException('Failed to create payment source');
    }
    return { id: paymentSourceResult.data.id.toString(), token: paymentSourceResult.data.token };
  }

  private async createPaymentSourceForRider(rider: User): Promise<void> {
    const acceptanceToken = await this.getAcceptanceToken();
    const { token } = await this.getTokenizedCard();
    const paymentSource = await this.createPaymentSource(token, rider.email, acceptanceToken);

    const paymentMethod = this.paymentRepository.create({
      user: rider,
      wompi_token: paymentSource.token,
      payment_source_id: Number(paymentSource.id),
      type: 'CARD',
      default_method: true,
    });

    await this.paymentRepository.save(paymentMethod);
  }

  /**
   * Records a transaction for a ride.
   *
   * @param ride - The ride object.
   * @param totalCharged - The total amount charged for the ride.
   * @param transactionResult - The result of the transaction.
   */
  @OnEvent('ride.finished')
  async handleRideFinished(
    ride: Ride,
    totalCharged: number,
    transactionResult: any
  ) {
    const transaction = new Transaction();
    transaction.ride_id = ride.id;
    transaction.user_id = ride.passenger.id;
    transaction.amount = totalCharged;
    transaction.status = transactionResult?.data?.id ? 'successful' : 'failed';
    transaction.wompi_transaction_id = transactionResult?.data?.id ?? '';

    await this.transactionRepository.save(transaction);
  }

  @OnEvent('ensurePaymentSource')
  async handleEnsurePaymentSource(rider: User): Promise<void> {
    const existingMethods = rider.paymentMethods?.length ?? 0;
    if (!existingMethods) {
      await this.createPaymentSourceForRider(rider);
    }
  }

  @OnEvent('createPaymentSource', { async: true, promisify: true})
  async handleCreatePaymentSource(rider: User, acceptance_token: string, callback: (error: any, paymentMethod: PaymentMethod | null) => void) {
    try {
        const { token } = await this.getTokenizedCard();
        const paymentSourceResult = await this.wompiService.paymentSources('CARD', token, rider.email, acceptance_token);

        if (!paymentSourceResult?.data?.id || !paymentSourceResult?.data?.token) {
            throw new Error('Failed to create payment source with Wompi API');
        }

        const paymentMethod = new PaymentMethod();
        paymentMethod.user = rider;
        paymentMethod.wompi_token = paymentSourceResult.data.token;
        paymentMethod.payment_source_id = paymentSourceResult.data.id;
        paymentMethod.type = 'CARD';
        paymentMethod.default_method = true;

        await this.paymentRepository.save(paymentMethod);
        callback(null, paymentMethod); // No error, pass result
    } catch (error) {
        callback(error, null); // Pass error
    }
}
}
