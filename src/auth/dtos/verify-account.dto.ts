import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyAccountDTO {
  @ApiProperty({
    example: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @ApiProperty({
    example: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  isVerifiedAccount: boolean;
}
