import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { RideService } from './ride.service';
import { CreateRideDto } from './dto/create-ride.dto';
import { ApiTags } from '@nestjs/swagger';
import { Documentation } from '@ride-spark/nest/swagger';
import { CreatePaymentSourceDto, FinishRideDto } from './dto';

@ApiTags('Ride')
@Controller('ride')
export class RideController {
  constructor(private rideService: RideService) {}

  @Post('/rides')
  @Documentation({
    description: 'Create a new ride.',
    summary: 'Create a ride',
  })
  createRide(@Body() createRideDto: CreateRideDto) {
    return this.rideService.createRide(createRideDto);
  }

  @Post('/payment-source')
  @Documentation({
    description: 'Create a payment source for a rider.',
    summary: 'Create Payment Source',
  })
  createPaymentSource(@Body() createPaymentSourceDto: CreatePaymentSourceDto) {
    return this.rideService.createPaymentSource(createPaymentSourceDto);
  }

  @Get('/:rideId')
  @Documentation({
    description: 'Get a ride by id.',
    summary: 'Get a ride by id',
  })
  getRideById(@Param('rideId', ParseIntPipe) rideId: number) {
    return this.rideService.getRideById(rideId);
  }

  @Patch('/:rideId/finish')
  @Documentation({
    description: 'Finish a ride.',
    summary: 'Finish a ride',
  })
  async finishRide(
    @Param('rideId', ParseIntPipe) rideId: number,
    @Body() finishRideDto: FinishRideDto
  ) {
    return this.rideService.finishRide(rideId, finishRideDto);
  }
}
