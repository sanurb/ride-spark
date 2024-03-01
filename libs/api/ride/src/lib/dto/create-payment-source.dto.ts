import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNumber } from 'class-validator';

export class CreatePaymentSourceDto {
  // rider_id
  @ApiProperty({
    description: 'The id of the passenger who requested the ride.',
    type: Number,
    example: 1,
  })
  @IsNumber()
  rider_id!: number;

  @ApiProperty({
    description: 'The acceptance token.',
    type: String,
    example: 'qwertyuiop123456789qwerty',
  })
  @IsDefined()
  acceptance_token!: string;
}
