import { IsArray, IsNumber, IsString } from 'class-validator';
import { Point } from 'geojson';

export class PointType implements Point {
  @IsString()
  type: 'Point';

  @IsArray()
  @IsNumber({}, { each: true })
  coordinates: number[];
}
