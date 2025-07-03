import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDTO {
  @ApiPropertyOptional({
    example: '',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({
    example: '',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
