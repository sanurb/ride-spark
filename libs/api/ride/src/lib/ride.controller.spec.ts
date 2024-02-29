import { Test } from '@nestjs/testing';
import { RideController } from './ride.controller';
import { RideService } from './ride.service';

describe('RideController', () => {
  let controller: RideController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [RideService],
      controllers: [RideController],
    }).compile();

    controller = module.get(RideController);
  });

  it('should be defined', () => {
    expect(controller).toBeTruthy();
  });
});
