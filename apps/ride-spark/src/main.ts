import { bootstrap } from '@ride-spark/infra-nest-server';
import { AppModule } from './app/app.module';
import { openApi } from './config/swagger-openapi.constant';

bootstrap({
  appModule: AppModule,
  name: 'api',
  port: 4444,
  enableVersioning: true,
  stripNonClassValidatorInputs: false,
  jsonBodyLimit: '300kb',
  openApi: openApi,
  swaggerPath: '/swagger'
})
