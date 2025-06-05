import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AddToSuggestionsDto {
  @ApiProperty({ description: 'Release ID', example: 12345 })
  @IsNumber()
  @Type(() => Number)
  releaseId: number;

  @ApiPropertyOptional({
    description: 'Notes about this release suggestion',
    example: 'Recommended by friend, similar to other albums I like',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
