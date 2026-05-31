import {
  Controller,
  Get,
  Param,
  Query,
  Logger,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiSecurity,
} from '@nestjs/swagger';
import { CollectionService } from './collection.service';
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
  @ApiResponse({ status: 200, description: 'User collection retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing API key' })
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
  @ApiResponse({ status: 200, description: 'User wantlist retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing API key' })
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
}
