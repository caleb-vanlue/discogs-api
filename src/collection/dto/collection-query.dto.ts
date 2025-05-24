import { IsOptional, IsNumber, IsString, IsIn, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  CollectionSortField,
  WantlistSortField,
} from '../../common/constants/sort.constants';

export class CollectionQueryDto {
  @ApiPropertyOptional({
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
    default: 50,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Number of items to skip',
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  offset?: number;

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: [
      'dateAdded',
      'title',
      'primaryArtist',
      'year',
      'rating',
      'primaryGenre',
      'primaryFormat',
    ],
    default: 'dateAdded',
  })
  @IsOptional()
  @IsString()
  @IsIn([
    'dateAdded',
    'title',
    'primaryArtist',
    'year',
    'rating',
    'primaryGenre',
    'primaryFormat',
  ])
  sort_by?: CollectionSortField;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC', 'asc', 'desc'])
  sort_order?: string;
}

export class WantlistQueryDto {
  @ApiPropertyOptional({
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
    default: 50,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Number of items to skip',
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  offset?: number;

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: [
      'dateAdded',
      'title',
      'primaryArtist',
      'year',
      'primaryGenre',
      'primaryFormat',
    ],
    default: 'dateAdded',
  })
  @IsOptional()
  @IsString()
  @IsIn([
    'dateAdded',
    'title',
    'primaryArtist',
    'year',
    'primaryGenre',
    'primaryFormat',
  ])
  sort_by?: WantlistSortField;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC', 'asc', 'desc'])
  sort_order?: string;
}
