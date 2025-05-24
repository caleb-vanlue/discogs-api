import { IsOptional, IsNumber, IsString, IsIn, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ReleaseSortField } from '../../common/constants/sort.constants';

export class ReleaseQueryDto {
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
    enum: ['title', 'primaryArtist', 'year', 'primaryGenre', 'createdAt'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  @IsIn(['title', 'primaryArtist', 'year', 'primaryGenre', 'createdAt'])
  sortBy?: ReleaseSortField;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC', 'asc', 'desc'])
  sortOrder?: string;
}
