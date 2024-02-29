import { DynamicModule, Module, Type } from '@nestjs/common';
import { InfraNestServerController } from './infra-nest-server.controller';
import { InfraNestServerService } from './infra-nest-server.service';

interface InfraModuleOptions {
  appModule: Type<any>
}


@Module({
  controllers: [InfraNestServerController],
  providers: [InfraNestServerService],
  exports: [InfraNestServerService],
})

export class InfraNestServerModule {
  static forRoot({ appModule }: InfraModuleOptions): DynamicModule {
    const imports = [appModule]
    return {
      module: InfraNestServerModule,
      imports,
    }
  }
}
