import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Logger,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiSecurity,
} from '@nestjs/swagger';
import { DiscogsApiService } from './discogs-api.service';
import { DiscogsSyncService } from './discogs-sync.service';
import { DiscogsQueryParams } from './types/discogs.types';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

@ApiTags('discogs')
@ApiSecurity('api-key')
@UseGuards(ApiKeyGuard)
@Controller('discogs')
export class DiscogsController {
  private readonly logger = new Logger(DiscogsController.name);

  constructor(
    private readonly discogsApi: DiscogsApiService,
    private readonly discogsSyncService: DiscogsSyncService,
  ) {}

  @Get('collection')
  @ApiOperation({
    summary: 'Fetch collection from Discogs API',
    description:
      'Directly fetch collection data from Discogs without storing in database',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'per_page', required: false, type: Number })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ['artist', 'title', 'rating', 'added', 'year'],
  })
  @ApiQuery({ name: 'sort_order', required: false, enum: ['asc', 'desc'] })
  async getCollection(
    @Query('page') page?: number,
    @Query('per_page') perPage?: number,
    @Query('sort') sort?: string,
    @Query('sort_order') sortOrder?: string,
  ) {
    this.logger.log('Fetching collection from Discogs API');

    const params: DiscogsQueryParams = {
      page: page || 1,
      perPage: perPage || 50,
      sort: sort as any,
      sortOrder: sortOrder as any,
    };

    return this.discogsApi.getCollection(params);
  }

  @Get('wantlist')
  @ApiOperation({
    summary: 'Fetch wantlist from Discogs API',
    description:
      'Directly fetch wantlist data from Discogs without storing in database',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'per_page', required: false, type: Number })
  async getWantlist(
    @Query('page') page?: number,
    @Query('per_page') perPage?: number,
  ) {
    this.logger.log('Fetching wantlist from Discogs API');

    const params: DiscogsQueryParams = {
      page: page || 1,
      perPage: perPage || 50,
    };

    return this.discogsApi.getWantlist(params);
  }

  @Post('sync/collection')
  @ApiOperation({
    summary: 'Sync collection from Discogs to database',
    description:
      'Fetches all collection data from Discogs and stores it in the local database',
  })
  @ApiParam({
    name: 'userId',
    required: false,
    description: 'User ID to sync for',
  })
  async syncCollection(@Param('userId') userId?: string) {
    this.logger.log(
      `Starting collection sync for user: ${userId || 'default'}`,
    );

    const result = await this.discogsSyncService.syncUserCollection(userId);

    return {
      message: 'Collection sync completed',
      ...result,
    };
  }

  @Post('sync/wantlist')
  @ApiOperation({
    summary: 'Sync wantlist from Discogs to database',
    description:
      'Fetches all wantlist data from Discogs and stores it in the local database',
  })
  @ApiParam({
    name: 'userId',
    required: false,
    description: 'User ID to sync for',
  })
  async syncWantlist(@Param('userId') userId?: string) {
    this.logger.log(`Starting wantlist sync for user: ${userId || 'default'}`);

    const result = await this.discogsSyncService.syncUserWantlist(userId);

    return {
      message: 'Wantlist sync completed',
      ...result,
    };
  }

  @Post('sync/all')
  @ApiOperation({
    summary: 'Sync both collection and wantlist',
    description:
      'Fetches and syncs both collection and wantlist data from Discogs',
  })
  @ApiParam({
    name: 'userId',
    required: false,
    description: 'User ID to sync for',
  })
  async syncAll(@Param('userId') userId?: string) {
    this.logger.log(`Starting full sync for user: ${userId || 'default'}`);

    const result = await this.discogsSyncService.syncAll(userId);

    return {
      message: 'Full sync completed',
      ...result,
    };
  }

  @Get('sync/status')
  @ApiOperation({
    summary: 'Get sync status',
    description:
      'Returns information about the current sync status and database contents',
  })
  @ApiParam({
    name: 'userId',
    required: false,
    description: 'User ID to check status for',
  })
  async getSyncStatus(@Param('userId') userId?: string) {
    this.logger.log(`Getting sync status for user: ${userId || 'default'}`);

    return this.discogsSyncService.getSyncStatus(userId);
  }

  @Get('test-connection')
  @ApiOperation({
    summary: 'Test Discogs API connection',
    description: 'Test if the Discogs API credentials are working',
  })
  async testConnection() {
    this.logger.log('Testing Discogs API connection');

    try {
      const result = await this.discogsApi.getCollection({
        page: 1,
        perPage: 1,
      });

      return {
        status: 'success',
        message: 'Discogs API connection successful',
        totalItems: result.pagination.items,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Discogs API connection failed',
        error: error.message,
      };
    }
  }
}
