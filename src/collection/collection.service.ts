import { Injectable, Logger } from '@nestjs/common';
import {
  SortOrder,
  UserWantlistRepository,
  WantlistSortField,
} from './repositories/user-wantlist.repository';
import {
  UserCollectionRepository,
  CollectionSortField,
} from './repositories/user-collection.repository';

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
      limit || 50,
      offset || 0,
      sortField,
      order,
    );

    return {
      data: items,
      total,
      limit: limit || 50,
      offset: offset || 0,
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
      limit || 50,
      offset || 0,
      sortField,
      order,
    );

    return {
      data: items,
      total,
      limit: limit || 50,
      offset: offset || 0,
      hasMore: (offset || 0) + items.length < total,
      sortBy: sortField,
      sortOrder: order,
    };
  }

  async getUserStats(userId: string) {
    const [collectionStats, wantlistStats] = await Promise.all([
      this.collectionRepo.getCollectionStats(userId),
      this.wantlistRepo.getWantlistStats(userId),
    ]);

    return {
      collection: collectionStats,
      wantlist: wantlistStats,
      summary: {
        totalItems: collectionStats.totalItems + wantlistStats.totalItems,
        collectionItems: collectionStats.totalItems,
        wantlistItems: wantlistStats.totalItems,
      },
    };
  }

  async addToCollection(
    userId: string,
    data: { releaseId: number; rating?: number; notes?: string },
  ) {
    const existing = await this.collectionRepo.findByUserAndRelease(
      userId,
      data.releaseId,
    );
    if (existing) {
      throw new Error('Release already in collection');
    }

    return this.collectionRepo.addToCollection({
      userId,
      releaseId: data.releaseId,
      rating: data.rating || 0,
      notes: data.notes,
      dateAdded: new Date(),
    });
  }

  async addToWantlist(
    userId: string,
    data: { releaseId: number; notes?: string },
  ) {
    const existing = await this.wantlistRepo.findByUserAndRelease(
      userId,
      data.releaseId,
    );
    if (existing) {
      throw new Error('Release already in wantlist');
    }

    return this.wantlistRepo.addToWantlist({
      userId,
      releaseId: data.releaseId,
      notes: data.notes,
      dateAdded: new Date(),
    });
  }

  async removeFromCollection(userId: string, releaseId: number) {
    await this.collectionRepo.removeFromCollection(userId, releaseId);
    return { message: 'Release removed from collection', releaseId };
  }

  async removeFromWantlist(userId: string, releaseId: number) {
    await this.wantlistRepo.removeFromWantlist(userId, releaseId);
    return { message: 'Release removed from wantlist', releaseId };
  }

  getCollectionSortOptions() {
    return this.collectionRepo.getAvailableSortOptions();
  }

  getWantlistSortOptions() {
    return this.wantlistRepo.getAvailableSortOptions();
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
