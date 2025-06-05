import { IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SuggestReleaseDto {
  @ApiProperty({ description: 'Discogs release ID to suggest' })
  @IsInt()
  releaseId: number;

  @ApiPropertyOptional({ description: 'Optional notes for the suggestion' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class SuggestReleaseResponse {
  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiPropertyOptional({ description: 'Instance ID if successfully added' })
  instance_id?: number;
}

