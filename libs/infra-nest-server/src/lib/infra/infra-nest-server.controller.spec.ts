import { Test } from '@nestjs/testing';
import { InfraNestServerController } from './infra-nest-server.controller';
import { InfraNestServerService } from './infra-nest-server.service';

describe('InfraNestServerController', () => {
  let controller: InfraNestServerController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [InfraNestServerService],
      controllers: [InfraNestServerController],
    }).compile();

    controller = module.get(InfraNestServerController);
  });

  it('should be defined', () => {
    expect(controller).toBeTruthy();
  });
});
