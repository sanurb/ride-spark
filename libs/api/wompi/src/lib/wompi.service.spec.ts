import { Test } from '@nestjs/testing';
import { WompiService } from './wompi.service';

describe('WompiService', () => {
  let service: WompiService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [WompiService],
    }).compile();

    service = module.get(WompiService);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });
});
