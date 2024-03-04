import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsLatitude, IsLongitude } from 'class-validator';

export class FinishRideDto {
  @ApiProperty({
    description:
      'The final location where the ride ended, in [longitude, latitude] format.',
    example: [-76.5360452, 3.4216413],
    type: [Number],
  })
  @IsArray()
  @ArrayMinSize(2)
  @IsLongitude({ each: true })
  @IsLatitude({ each: true })
  finalLocation: [number, number];
}
