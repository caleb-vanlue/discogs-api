import { Injectable, Logger } from '@nestjs/common';
import { UserCollectionRepository } from './repositories/user-collection.repository';
import { UserWantlistRepository } from './repositories/user-wantlist.repository';

@Injectable()
export class CollectionService {
  private readonly logger = new Logger(CollectionService.name);

  constructor(
    private readonly collectionRepo: UserCollectionRepository,
    private readonly wantlistRepo: UserWantlistRepository,
  ) {}

  async getUserCollection(userId: string, limit?: number, offset?: number) {
    const [items, total] = await this.collectionRepo.findByUserId(
      userId,
      limit || 50,
      offset || 0,
    );

    return {
      data: items,
      total,
      limit: limit || 50,
      offset: offset || 0,
      hasMore: (offset || 0) + items.length < total,
    };
  }

  async getUserWantlist(userId: string, limit?: number, offset?: number) {
    const [items, total] = await this.wantlistRepo.findByUserId(
      userId,
      limit || 50,
      offset || 0,
    );

    return {
      data: items,
      total,
      limit: limit || 50,
      offset: offset || 0,
      hasMore: (offset || 0) + items.length < total,
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
}
