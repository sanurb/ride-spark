import { Body, Controller, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { RideService } from './ride.service';
import { CreateRideDto } from './dto/create-ride.dto';
import { ApiTags } from '@nestjs/swagger';
import { Documentation } from '@ride-spark/nest/swagger';
import { FinishRideDto } from './dto';

@ApiTags('ride')
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

  @Patch('/:rideId/finish')
  @Documentation({
    description: 'Finish a ride.',
    summary: 'Finish a ride',
  })
  async finishRide(
    @Param('rideId', ParseIntPipe) rideId: number,
    @Body() finishRideDto: FinishRideDto
  ) {
    return this.rideService.finishRide(rideId, finishRideDto.finalLocation);
  }
}
