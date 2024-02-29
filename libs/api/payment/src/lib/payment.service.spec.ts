import { Test } from '@nestjs/testing';
import { PaymentService } from './payment.service';

describe('PaymentService', () => {
  let service: PaymentService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [PaymentService],
    }).compile();

    service = module.get(PaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });
});
