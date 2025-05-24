import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AddToWantlistDto {
  @ApiProperty({ description: 'Release ID', example: 12345 })
  @IsNumber()
  @Type(() => Number)
  releaseId: number;

  @ApiPropertyOptional({
    description: 'Notes about this release',
    example: 'Looking for first pressing in good condition',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
