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
    description: 'Full name of the user',
    example: 'John Doe Updated',
    minLength: 4,
  })
  @IsOptional()
  @IsString()
  @MinLength(4)
  fullName?: string;

  @ApiPropertyOptional({
    description: 'User password',
    example: 'newpassword123',
    minLength: 8,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}

export class UpdateUserByIdDTO extends UpdateBaseUserInfoByIdDTO {
  @ApiPropertyOptional({
    description: 'Last login date',
    type: 'string',
    format: 'date-time',
    example: '2024-01-15T10:00:00Z',
  })
  @IsOptional()
  @IsDate()
  lastLoginDate?: Date;
}
