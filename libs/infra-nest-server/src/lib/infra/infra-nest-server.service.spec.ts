import { Test } from '@nestjs/testing';
import { InfraNestServerService } from './infra-nest-server.service';

describe('InfraNestServerService', () => {
  let service: InfraNestServerService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [InfraNestServerService],
    }).compile();

    service = module.get(InfraNestServerService);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });
});
