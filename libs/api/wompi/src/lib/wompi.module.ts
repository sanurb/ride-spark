import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { WompiService } from './wompi.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [WompiService],
  exports: [WompiService],
})
export class WompiModule {}
