import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  Logger,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiResponse,
} from '@nestjs/swagger';
import { DiscogsApiService } from './discogs-api.service';
import { SuggestionService } from './suggestion.service';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import {
  SearchReleasesDto,
  SearchReleasesResponse,
} from './dto/search-releases.dto';
import { AddToSuggestionsDto } from '../collection/dto/add-to-suggestions.dto';
import { CollectionQueryDto } from '../collection/dto/collection-query.dto';

@ApiTags('discogs')
@ApiSecurity('api-key')
@UseGuards(ApiKeyGuard)
@Controller('discogs')
export class DiscogsController {
  private readonly logger = new Logger(DiscogsController.name);

  constructor(
    private readonly discogsApi: DiscogsApiService,
    private readonly suggestionService: SuggestionService,
  ) {}

  @Get('search')
  @ApiOperation({
    summary: 'Search Discogs releases',
    description: 'Search for releases on Discogs by query string',
  })
  @ApiResponse({ status: 200, description: 'Search results', type: SearchReleasesResponse })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  async searchReleases(@Query() searchDto: SearchReleasesDto) {
    this.logger.log(`Searching releases with query: ${searchDto.query}`);
    return this.discogsApi.searchReleases(
      searchDto.query,
      searchDto.page,
      searchDto.per_page,
    );
  }

  @Get('suggestions/:userId')
  @ApiOperation({ summary: 'Get user suggestions' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User suggestions retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing API key' })
  async getUserSuggestions(
    @Param('userId') userId: string,
    @Query() query: CollectionQueryDto,
  ) {
    this.logger.log(`Getting suggestions for user ${userId}`);
    return this.suggestionService.getUserSuggestions(
      userId,
      query.limit,
      query.offset,
      query.sort_by,
      query.sort_order,
    );
  }

  @Post('suggestions/:userId')
  @ApiOperation({ summary: 'Add release to suggestions' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 201, description: 'Release added to suggestions successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing API key' })
  @ApiResponse({ status: 409, description: 'Release already in suggestions' })
  async addToSuggestions(
    @Param('userId') userId: string,
    @Body() data: AddToSuggestionsDto,
  ) {
    this.logger.log(`Adding release ${data.releaseId} to suggestions for user ${userId}`);
    return this.suggestionService.addToSuggestions(userId, data);
  }

  @Delete('suggestions/:userId/:releaseId')
  @ApiOperation({ summary: 'Remove release from suggestions' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiParam({ name: 'releaseId', description: 'Release ID' })
  @ApiResponse({ status: 200, description: 'Release removed from suggestions successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing API key' })
  @ApiResponse({ status: 404, description: 'Release not found in suggestions' })
  async removeFromSuggestions(
    @Param('userId') userId: string,
    @Param('releaseId', ParseIntPipe) releaseId: number,
  ) {
    this.logger.log(`Removing release ${releaseId} from suggestions for user ${userId}`);
    return this.suggestionService.removeFromSuggestions(userId, releaseId);
  }
}
