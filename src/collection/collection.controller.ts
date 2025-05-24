import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { CollectionService } from './collection.service';

@ApiTags('collection')
@Controller('collection')
export class CollectionController {
  private readonly logger = new Logger(CollectionController.name);

  constructor(private readonly collectionService: CollectionService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Get user collection' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of items to skip',
  })
  @ApiQuery({
    name: 'sort_by',
    required: false,
    type: String,
    description: 'Sort field',
    enum: ['added', 'title', 'artist', 'year', 'rating', 'genre', 'format'],
  })
  @ApiQuery({
    name: 'sort_order',
    required: false,
    type: String,
    description: 'Sort order',
    enum: ['asc', 'desc'],
  })
  async getUserCollection(
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('sort_by') sortBy?: string,
    @Query('sort_order') sortOrder?: string,
  ) {
    this.logger.log(
      `Getting collection for user ${userId} - sort: ${sortBy} ${sortOrder}`,
    );
    return this.collectionService.getUserCollection(
      userId,
      limit,
      offset,
      sortBy,
      sortOrder,
    );
  }

  @Get(':userId/wantlist')
  @ApiOperation({ summary: 'Get user wantlist' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of items to skip',
  })
  @ApiQuery({
    name: 'sort_by',
    required: false,
    type: String,
    description: 'Sort field',
    enum: ['added', 'title', 'artist', 'year', 'genre', 'format'],
  })
  @ApiQuery({
    name: 'sort_order',
    required: false,
    type: String,
    description: 'Sort order',
    enum: ['asc', 'desc'],
  })
  async getUserWantlist(
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('sort_by') sortBy?: string,
    @Query('sort_order') sortOrder?: string,
  ) {
    this.logger.log(
      `Getting wantlist for user ${userId} - sort: ${sortBy} ${sortOrder}`,
    );
    return this.collectionService.getUserWantlist(
      userId,
      limit,
      offset,
      sortBy,
      sortOrder,
    );
  }

  @Get(':userId/stats')
  @ApiOperation({ summary: 'Get user collection and wantlist stats' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  async getUserStats(@Param('userId') userId: string) {
    this.logger.log(`Getting stats for user ${userId}`);
    return this.collectionService.getUserStats(userId);
  }

  @Get(':userId/sort-options')
  @ApiOperation({ summary: 'Get available sort options' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  async getSortOptions() {
    this.logger.log('Getting available sort options');
    return {
      collection: this.collectionService.getCollectionSortOptions(),
      wantlist: this.collectionService.getWantlistSortOptions(),
    };
  }

  @Post(':userId/collection')
  @ApiOperation({ summary: 'Add release to collection' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiBody({
    schema: {
      properties: {
        releaseId: { type: 'number' },
        rating: { type: 'number', minimum: 0, maximum: 5 },
        notes: { type: 'string' },
      },
      required: ['releaseId'],
    },
  })
  async addToCollection(
    @Param('userId') userId: string,
    @Body() data: { releaseId: number; rating?: number; notes?: string },
  ) {
    this.logger.log(
      `Adding release ${data.releaseId} to collection for user ${userId}`,
    );
    return this.collectionService.addToCollection(userId, data);
  }

  @Post(':userId/wantlist')
  @ApiOperation({ summary: 'Add release to wantlist' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiBody({
    schema: {
      properties: {
        releaseId: { type: 'number' },
        notes: { type: 'string' },
      },
      required: ['releaseId'],
    },
  })
  async addToWantlist(
    @Param('userId') userId: string,
    @Body() data: { releaseId: number; notes?: string },
  ) {
    this.logger.log(
      `Adding release ${data.releaseId} to wantlist for user ${userId}`,
    );
    return this.collectionService.addToWantlist(userId, data);
  }

  @Delete(':userId/collection/:releaseId')
  @ApiOperation({ summary: 'Remove release from collection' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiParam({ name: 'releaseId', description: 'Release ID' })
  async removeFromCollection(
    @Param('userId') userId: string,
    @Param('releaseId') releaseId: number,
  ) {
    this.logger.log(
      `Removing release ${releaseId} from collection for user ${userId}`,
    );
    return this.collectionService.removeFromCollection(userId, releaseId);
  }

  @Delete(':userId/wantlist/:releaseId')
  @ApiOperation({ summary: 'Remove release from wantlist' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiParam({ name: 'releaseId', description: 'Release ID' })
  async removeFromWantlist(
    @Param('userId') userId: string,
    @Param('releaseId') releaseId: number,
  ) {
    this.logger.log(
      `Removing release ${releaseId} from wantlist for user ${userId}`,
    );
    return this.collectionService.removeFromWantlist(userId, releaseId);
  }
}
