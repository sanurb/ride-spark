import { Controller } from '@nestjs/common';
import { InfraNestServerService } from './infra-nest-server.service';

@Controller('infra-nest-server')
export class InfraNestServerController {
  constructor(private infraNestServerService: InfraNestServerService) {}
}
