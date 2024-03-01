import { IsBoolean, IsDefined, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

export class CreatePaymentDto {
  @IsNumber()
  @IsDefined()
  user_id: number;

  @IsDefined()
  @IsString()
  wompi_token: string;

  @IsNumber()
  @IsPositive()
  payment_source_id: number;

  @IsOptional()
  type: string;

  @IsOptional()
  @IsBoolean()
  default_method: boolean;
}
