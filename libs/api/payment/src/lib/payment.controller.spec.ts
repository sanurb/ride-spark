import { Test } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

describe('PaymentController', () => {
  let controller: PaymentController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [PaymentService],
      controllers: [PaymentController],
    }).compile();

    controller = module.get(PaymentController);
  });

  it('should be defined', () => {
    expect(controller).toBeTruthy();
  });
});
