import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Logger,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBody,
  ApiSecurity,
} from '@nestjs/swagger';
import { CollectionService } from './collection.service';
import { AddToCollectionDto } from './dto/add-to-collection.dto';
import { AddToWantlistDto } from './dto/add-to-wantlist.dto';
import {
  CollectionQueryDto,
  WantlistQueryDto,
} from './dto/collection-query.dto';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

@ApiTags('collection')
@ApiSecurity('api-key')
@UseGuards(ApiKeyGuard)
@Controller('collection')
export class CollectionController {
  private readonly logger = new Logger(CollectionController.name);

  constructor(private readonly collectionService: CollectionService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Get user collection' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User collection retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing API key',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getUserCollection(
    @Param('userId') userId: string,
    @Query() query: CollectionQueryDto,
  ) {
    this.logger.log(
      `Getting collection for user ${userId} - sort: ${query.sort_by} ${query.sort_order}`,
    );
    return this.collectionService.getUserCollection(
      userId,
      query.limit,
      query.offset,
      query.sort_by,
      query.sort_order,
    );
  }

  @Get(':userId/wantlist')
  @ApiOperation({ summary: 'Get user wantlist' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User wantlist retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing API key',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getUserWantlist(
    @Param('userId') userId: string,
    @Query() query: WantlistQueryDto,
  ) {
    this.logger.log(
      `Getting wantlist for user ${userId} - sort: ${query.sort_by} ${query.sort_order}`,
    );
    return this.collectionService.getUserWantlist(
      userId,
      query.limit,
      query.offset,
      query.sort_by,
      query.sort_order,
    );
  }


  @Get(':userId/stats')
  @ApiOperation({ summary: 'Get user collection and wantlist stats' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User stats retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing API key',
  })
  async getUserStats(@Param('userId') userId: string) {
    this.logger.log(`Getting stats for user ${userId}`);
    return this.collectionService.getUserStats(userId);
  }

  @Get(':userId/sort-options')
  @ApiOperation({ summary: 'Get available sort options' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Sort options retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing API key',
  })
  getSortOptions() {
    this.logger.log('Getting available sort options');
    return {
      collection: this.collectionService.getCollectionSortOptions(),
      wantlist: this.collectionService.getWantlistSortOptions(),
    };
  }

  @Post(':userId/collection')
  @ApiOperation({ summary: 'Add release to collection' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiBody({ type: AddToCollectionDto })
  @ApiResponse({
    status: 201,
    description: 'Release added to collection successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing API key',
  })
  @ApiResponse({
    status: 409,
    description: 'Release already in collection',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  async addToCollection(
    @Param('userId') userId: string,
    @Body() data: AddToCollectionDto,
  ) {
    this.logger.log(
      `Adding release ${data.releaseId} to collection for user ${userId}`,
    );
    return this.collectionService.addToCollection(userId, data);
  }

  @Post(':userId/wantlist')
  @ApiOperation({ summary: 'Add release to wantlist' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiBody({ type: AddToWantlistDto })
  @ApiResponse({
    status: 201,
    description: 'Release added to wantlist successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing API key',
  })
  @ApiResponse({
    status: 409,
    description: 'Release already in wantlist',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  async addToWantlist(
    @Param('userId') userId: string,
    @Body() data: AddToWantlistDto,
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
  @ApiResponse({
    status: 200,
    description: 'Release removed from collection successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing API key',
  })
  @ApiResponse({
    status: 404,
    description: 'Release not found in collection',
  })
  async removeFromCollection(
    @Param('userId') userId: string,
    @Param('releaseId', ParseIntPipe) releaseId: number,
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
  @ApiResponse({
    status: 200,
    description: 'Release removed from wantlist successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing API key',
  })
  @ApiResponse({
    status: 404,
    description: 'Release not found in wantlist',
  })
  async removeFromWantlist(
    @Param('userId') userId: string,
    @Param('releaseId', ParseIntPipe) releaseId: number,
  ) {
    this.logger.log(
      `Removing release ${releaseId} from wantlist for user ${userId}`,
    );
    return this.collectionService.removeFromWantlist(userId, releaseId);
  }

}
