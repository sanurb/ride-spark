import { PointType } from "@backend/api/common";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsObject, ValidateNested } from "class-validator";

export class FinishRideDto {
  @ApiProperty({
      description: 'The final location where the ride ended.',
      type: () => PointType,
      example: { type: 'Point', coordinates: [-76.5360452, 3.4216413] },
  })
  @IsObject()
  @ValidateNested()
  @Type(() => PointType)
  finalLocation: PointType;
}
