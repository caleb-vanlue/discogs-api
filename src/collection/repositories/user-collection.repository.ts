import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCollection } from '../../database/entities/user-collection.entity';

@Injectable()
export class UserCollectionRepository {
  private readonly logger = new Logger(UserCollectionRepository.name);

  constructor(
    @InjectRepository(UserCollection)
    private readonly repository: Repository<UserCollection>,
  ) {}

  async findByUserId(
    userId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<[UserCollection[], number]> {
    this.logger.log(`Finding collection for user ${userId}`);

    return this.repository.findAndCount({
      where: { userId },
      relations: ['release'],
      take: limit,
      skip: offset,
      order: { dateAdded: 'DESC' },
    });
  }

  async findByUserAndRelease(
    userId: string,
    releaseId: number,
  ): Promise<UserCollection | null> {
    return this.repository.findOne({
      where: { userId, releaseId },
      relations: ['release'],
    });
  }

  async addToCollection(data: {
    userId: string;
    releaseId: number;
    discogsInstanceId?: number;
    folderId?: number;
    rating?: number;
    notes?: string;
    dateAdded?: Date;
    customFields?: Record<string, any>;
  }): Promise<UserCollection> {
    this.logger.log(
      `Adding release ${data.releaseId} to user ${data.userId} collection`,
    );

    const collectionItem = this.repository.create(data);
    return this.repository.save(collectionItem);
  }

  async updateCollectionItem(
    userId: string,
    releaseId: number,
    updates: Partial<UserCollection>,
  ): Promise<UserCollection | null> {
    await this.repository.update({ userId, releaseId }, updates);
    return this.findByUserAndRelease(userId, releaseId);
  }

  async removeFromCollection(userId: string, releaseId: number): Promise<void> {
    this.logger.log(
      `Removing release ${releaseId} from user ${userId} collection`,
    );
    await this.repository.delete({ userId, releaseId });
  }

  async getCollectionStats(userId: string) {
    const [items, total] = await this.repository.findAndCount({
      where: { userId },
    });

    const ratings = items.filter((item) => item.rating > 0);
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length
        : 0;

    return {
      totalItems: total,
      ratedItems: ratings.length,
      averageRating: Math.round(avgRating * 10) / 10,
    };
  }
}
