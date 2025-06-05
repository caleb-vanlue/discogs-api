import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { UserWantlistRepository } from './repositories/user-wantlist.repository';
import { UserCollectionRepository } from './repositories/user-collection.repository';
import { UserSuggestionRepository } from './repositories/user-suggestion.repository';
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
    private readonly suggestionRepo: UserSuggestionRepository,
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

  async getUserSuggestions(
    userId: string,
    limit?: number,
    offset?: number,
    sortBy?: string,
    sortOrder?: string,
  ) {
    const sortField = this.mapCollectionSortField(sortBy);
    const order = this.mapSortOrder(sortOrder);

    this.logger.log(
      `Getting suggestions for user ${userId} - sort: ${sortField} ${order}`,
    );

    const [items, total] = await this.suggestionRepo.findByUserIdSorted(
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

  async getUserStats(userId: string) {
    const [collectionStats, wantlistStats, suggestionStats] = await Promise.all(
      [
        this.collectionRepo.getCollectionStats(userId),
        this.wantlistRepo.getWantlistStats(userId),
        this.suggestionRepo.getSuggestionsStats(userId),
      ],
    );

    return {
      collection: collectionStats,
      wantlist: wantlistStats,
      suggestions: suggestionStats,
      summary: {
        totalItems:
          collectionStats.totalItems +
          wantlistStats.totalItems +
          suggestionStats.totalItems,
        collectionItems: collectionStats.totalItems,
        wantlistItems: wantlistStats.totalItems,
        suggestionItems: suggestionStats.totalItems,
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
      throw new ConflictException('Release already in collection');
    }

    try {
      return await this.collectionRepo.addToCollection({
        userId,
        releaseId: data.releaseId,
        rating: data.rating || 0,
        notes: data.notes,
        dateAdded: new Date(),
      });
    } catch (error) {
      this.logger.error(
        `Failed to add release ${data.releaseId} to collection for user ${userId}`,
        error,
      );
      throw error;
    }
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
      throw new ConflictException('Release already in wantlist');
    }

    try {
      return await this.wantlistRepo.addToWantlist({
        userId,
        releaseId: data.releaseId,
        notes: data.notes,
        dateAdded: new Date(),
      });
    } catch (error) {
      this.logger.error(
        `Failed to add release ${data.releaseId} to wantlist for user ${userId}`,
        error,
      );
      throw error;
    }
  }

  async removeFromCollection(userId: string, releaseId: number) {
    const existing = await this.collectionRepo.findByUserAndRelease(
      userId,
      releaseId,
    );

    if (!existing) {
      throw new NotFoundException('Release not found in collection');
    }

    try {
      await this.collectionRepo.removeFromCollection(userId, releaseId);
      return { message: 'Release removed from collection', releaseId };
    } catch (error) {
      this.logger.error(
        `Failed to remove release ${releaseId} from collection for user ${userId}`,
        error,
      );
      throw error;
    }
  }

  async removeFromWantlist(userId: string, releaseId: number) {
    const existing = await this.wantlistRepo.findByUserAndRelease(
      userId,
      releaseId,
    );

    if (!existing) {
      throw new NotFoundException('Release not found in wantlist');
    }

    try {
      await this.wantlistRepo.removeFromWantlist(userId, releaseId);
      return { message: 'Release removed from wantlist', releaseId };
    } catch (error) {
      this.logger.error(
        `Failed to remove release ${releaseId} from wantlist for user ${userId}`,
        error,
      );
      throw error;
    }
  }

  async addToSuggestions(
    userId: string,
    data: { releaseId: number; notes?: string },
  ) {
    const existing = await this.suggestionRepo.findByUserAndRelease(
      userId,
      data.releaseId,
    );

    if (existing) {
      throw new ConflictException('Release already in suggestions');
    }

    try {
      return await this.suggestionRepo.addToSuggestions({
        userId,
        releaseId: data.releaseId,
        notes: data.notes,
        dateAdded: new Date(),
      });
    } catch (error) {
      this.logger.error(
        `Failed to add release ${data.releaseId} to suggestions for user ${userId}`,
        error,
      );
      throw error;
    }
  }

  async removeFromSuggestions(userId: string, releaseId: number) {
    const existing = await this.suggestionRepo.findByUserAndRelease(
      userId,
      releaseId,
    );

    if (!existing) {
      throw new NotFoundException('Release not found in suggestions');
    }

    try {
      await this.suggestionRepo.removeFromSuggestions(userId, releaseId);
      return { message: 'Release removed from suggestions', releaseId };
    } catch (error) {
      this.logger.error(
        `Failed to remove release ${releaseId} from suggestions for user ${userId}`,
        error,
      );
      throw error;
    }
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
