import { Injectable, Logger } from '@nestjs/common';
import { UserWantlistRepository } from './repositories/user-wantlist.repository';
import { UserCollectionRepository } from './repositories/user-collection.repository';
import {
  CollectionSortField,
  WantlistSortField,
  SortOrder,
  DEFAULT_LIMIT,
  DEFAULT_OFFSET,
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
    const sortField = this.mapCollectionSortField(sortBy);
    const order = this.mapSortOrder(sortOrder);

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
    const sortField = this.mapWantlistSortField(sortBy);
    const order = this.mapSortOrder(sortOrder);

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

  private mapCollectionSortField(sortBy?: string): CollectionSortField {
    const mapping: Record<string, CollectionSortField> = {
      added: 'dateAdded',
      date_added: 'dateAdded',
      dateAdded: 'dateAdded',
      title: 'title',
      artist: 'primaryArtist',
      primaryArtist: 'primaryArtist',
      year: 'year',
      rating: 'rating',
      genre: 'primaryGenre',
      primaryGenre: 'primaryGenre',
      format: 'primaryFormat',
      primaryFormat: 'primaryFormat',
    };

    return mapping[sortBy || 'added'] || 'dateAdded';
  }

  private mapWantlistSortField(sortBy?: string): WantlistSortField {
    const mapping: Record<string, WantlistSortField> = {
      added: 'dateAdded',
      date_added: 'dateAdded',
      dateAdded: 'dateAdded',
      title: 'title',
      artist: 'primaryArtist',
      primaryArtist: 'primaryArtist',
      year: 'year',
      genre: 'primaryGenre',
      primaryGenre: 'primaryGenre',
      format: 'primaryFormat',
      primaryFormat: 'primaryFormat',
    };

    return mapping[sortBy || 'added'] || 'dateAdded';
  }

  private mapSortOrder(sortOrder?: string): SortOrder {
    const order = sortOrder?.toLowerCase();
    return order === 'asc' || order === 'ascending' ? 'ASC' : 'DESC';
  }
}
