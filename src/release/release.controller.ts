import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ReleaseService } from './release.service';
import {
  ApiOperation,
  ApiTags,
  ApiParam,
  ApiResponse,
  ApiSecurity,
} from '@nestjs/swagger';
import { ReleaseQueryDto } from './dto/release-query.dto';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

@ApiTags('releases')
@ApiSecurity('api-key')
@UseGuards(ApiKeyGuard)
@Controller('releases')
export class ReleaseController {
  constructor(private readonly releaseService: ReleaseService) {}

  @Get()
  @ApiOperation({ summary: 'Get all releases with pagination and sorting' })
  @ApiResponse({
    status: 200,
    description: 'Releases retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing API key',
  })
  async getReleases(@Query() query: ReleaseQueryDto) {
    return this.releaseService.getReleases(
      query.limit,
      query.offset,
      query.sortBy,
      query.sortOrder,
    );
  }

  @Get(':discogsId')
  @ApiOperation({ summary: 'Get release by Discogs ID' })
  @ApiParam({ name: 'discogsId', description: 'Discogs Release ID' })
  @ApiResponse({
    status: 200,
    description: 'Release found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing API key',
  })
  @ApiResponse({
    status: 404,
    description: 'Release not found',
  })
  async getReleaseByDiscogsId(
    @Param('discogsId', ParseIntPipe) discogsId: number,
  ) {
    return this.releaseService.getReleaseByDiscogsId(discogsId);
  }
}
