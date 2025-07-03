import {
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBaseUserInfoByIdDTO {
  @ApiPropertyOptional({
    example: '',
  })
  @IsOptional()
  @IsString()
  @MinLength(4)
  fullName?: string;

  @ApiPropertyOptional({
    example: '',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  userName?: string;

  @ApiPropertyOptional({
    example: '',
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  phoneNumber?: string;

  @ApiPropertyOptional({
    example: '',
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}

export class UpdateUserByIdDTO extends UpdateBaseUserInfoByIdDTO {
  @ApiPropertyOptional({
    example: '',
  })
  @IsOptional()
  @IsDate()
  lastLoginDate?: Date;
}
