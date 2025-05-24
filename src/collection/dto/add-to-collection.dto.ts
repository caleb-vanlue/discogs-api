import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AddToCollectionDto {
  @ApiProperty({ description: 'Release ID', example: 12345 })
  @IsNumber()
  @Type(() => Number)
  releaseId: number;

  @ApiPropertyOptional({
    description: 'Rating (0-5)',
    minimum: 0,
    maximum: 5,
    example: 4,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  @Type(() => Number)
  rating?: number;

  @ApiPropertyOptional({
    description: 'Personal notes about the release',
    example: 'Great condition, bought at local record store',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
