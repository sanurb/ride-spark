import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CorrelationIdMiddleware } from '@ride-spark/infra-nest-server';
import { ProblemModule } from '@ride-spark/nest/problem';
import { UserModule } from '@ride-spark/user';
import { EnvConfiguration } from '../config/env.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RideModule } from '@ride-spark/ride';
import { PaymentModule } from '@ride-spark/payment';
import { JoiValidationSchema } from '../config/joi.validation';

@Module({
  imports: [

    ConfigModule.forRoot({
      isGlobal: true,
      load: [ EnvConfiguration ],
      validationSchema: JoiValidationSchema
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: false,
      ssl: {
        rejectUnauthorized: false,
      }
    }),

    ProblemModule,
    UserModule,
    RideModule,
    PaymentModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}

