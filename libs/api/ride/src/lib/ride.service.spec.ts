import { Test } from '@nestjs/testing';
import { RideService } from './ride.service';

describe('RideService', () => {
  let service: RideService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [RideService],
    }).compile();

    service = module.get(RideService);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });
});
