import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CorrelationIdMiddleware } from '@ride-spark/infra-nest-server';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProblemModule } from '@ride-spark/nest/problem';

@Module({
  imports: [
    ProblemModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}

