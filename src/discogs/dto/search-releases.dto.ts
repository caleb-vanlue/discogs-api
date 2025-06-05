import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class SearchReleasesDto {
  @ApiProperty({ description: 'Search query' })
  @IsString()
  query: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 50 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value, 10))
  per_page?: number = 50;
}

export class SearchReleaseResult {
  @ApiProperty({ description: 'Release ID' })
  id: number;

  @ApiProperty({ description: 'Release title' })
  title: string;

  @ApiProperty({ description: 'Artists' })
  artist: string;

  @ApiProperty({ description: 'Release year' })
  year?: number;

  @ApiProperty({ description: 'Thumbnail image URL' })
  thumb?: string;

  @ApiProperty({ description: 'Cover image URL' })
  cover_image?: string;

  @ApiProperty({ description: 'Release format' })
  format?: string[];

  @ApiProperty({ description: 'Resource URL' })
  resource_url: string;
}

export class SearchReleasesResponse {
  @ApiProperty({ type: [SearchReleaseResult] })
  results: SearchReleaseResult[];

  @ApiProperty()
  pagination: {
    page: number;
    pages: number;
    per_page: number;
    items: number;
  };
}

