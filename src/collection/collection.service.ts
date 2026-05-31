import { Injectable, Logger } from '@nestjs/common';
import { UserWantlistRepository } from './repositories/user-wantlist.repository';
import { UserCollectionRepository } from './repositories/user-collection.repository';
import {
  DEFAULT_LIMIT,
  DEFAULT_OFFSET,
  mapCollectionSortField,
  mapWantlistSortField,
  mapSortOrder,
} from '../common/constants/sort.constants';

@Injectable()
export class CollectionService {
  private readonly logger = new Logger(CollectionService.name);

  constructor(
    private readonly collectionRepo: UserCollectionRepository,
    private readonly wantlistRepo: UserWantlistRepository,
  ) {}

  async getUserCollection(
    userId: string,
    limit?: number,
    offset?: number,
    sortBy?: string,
    sortOrder?: string,
  ) {
    const sortField = mapCollectionSortField(sortBy);
    const order = mapSortOrder(sortOrder);

    this.logger.log(
      `Getting collection for user ${userId} - sort: ${sortField} ${order}`,
    );

    const [items, total] = await this.collectionRepo.findByUserIdSorted(
      userId,
      limit || DEFAULT_LIMIT,
      offset || DEFAULT_OFFSET,
      sortField,
      order,
    );

    return {
      data: items,
      total,
      limit: limit || DEFAULT_LIMIT,
      offset: offset || DEFAULT_OFFSET,
      hasMore: (offset || 0) + items.length < total,
      sortBy: sortField,
      sortOrder: order,
    };
  }

  async getUserWantlist(
    userId: string,
    limit?: number,
    offset?: number,
    sortBy?: string,
    sortOrder?: string,
  ) {
    const sortField = mapWantlistSortField(sortBy);
    const order = mapSortOrder(sortOrder);

    this.logger.log(
      `Getting wantlist for user ${userId} - sort: ${sortField} ${order}`,
    );

    const [items, total] = await this.wantlistRepo.findByUserIdSorted(
      userId,
      limit || DEFAULT_LIMIT,
      offset || DEFAULT_OFFSET,
      sortField,
      order,
    );

    return {
      data: items,
      total,
      limit: limit || DEFAULT_LIMIT,
      offset: offset || DEFAULT_OFFSET,
      hasMore: (offset || 0) + items.length < total,
      sortBy: sortField,
      sortOrder: order,
    };
  }

}
