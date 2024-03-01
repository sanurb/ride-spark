import { IsNumber, IsOptional, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Point } from 'geojson';
import { ApiProperty } from '@nestjs/swagger';
import { PointType } from '@backend/api/common';

export class CreateRideDto {
    @ApiProperty({
      description: 'The id of the passenger who requested the ride.',
      type: Number,
      example: 1,
    })
    @IsNumber()
    passenger_id!: number;

    @ApiProperty({
      description: 'The location where the ride will start.',
      example: {
        type: 'Point',
        coordinates: [-76.5368824, 3.4438444] // Example: Longitude, Latitude
      },
      required: true,
      type: PointType,
    })
    @ValidateNested()
    @Type(() => PointType)
    start_location!: Point;

    @ApiProperty({
      description: 'The location where the ride will end.',
      example: {
        type: 'Point',
        coordinates: [-76.5360452, 3.4216413] // Example: Longitude, Latitude
      },
      required: true,
      type: PointType,
    })
    @ValidateNested()
    @Type(() => PointType)
    end_location!: Point;

    @IsEnum({ waiting: 'waiting', in_progress: 'in_progress', finished: 'finished' })
    @IsOptional()
    status?: string = 'waiting';
}
