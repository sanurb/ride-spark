import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsLatitude, IsLongitude, IsNumber } from 'class-validator';

export class CreateRideDto {
    @ApiProperty({
      description: 'The id of the passenger who requested the ride.',
      type: Number,
      example: 1,
    })
    @IsNumber()
    passenger_id!: number;

    @ApiProperty({
      description: 'The starting location coordinates (longitude, latitude).',
      example: [-76.5368824, 3.4438444],
      type: [Number],
    })
    @IsArray()
    @ArrayMinSize(2)
    @IsLongitude({ each: true })
    @IsLatitude({ each: true })
    start_location!: [number, number];

    @ApiProperty({
      description: 'The ending location coordinates (longitude, latitude).',
      example: [-76.5360452, 3.4216413],
      type: [Number],
    })
    @IsArray()
    @ArrayMinSize(2)
    @IsLongitude({ each: true })
    @IsLatitude({ each: true })
    end_location!: [number, number];
}
