import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSuggestion } from '../../database/entities/user-suggestion.entity';
import {
  CollectionSortField,
  SortOrder,
  DEFAULT_LIMIT,
  DEFAULT_OFFSET,
  DEFAULT_SORT_ORDER,
} from '../../common/constants/sort.constants';

@Injectable()
export class UserSuggestionRepository {
  private readonly logger = new Logger(UserSuggestionRepository.name);

  constructor(
    @InjectRepository(UserSuggestion)
    private readonly repository: Repository<UserSuggestion>,
  ) {}

  async findByUserIdSorted(
    userId: string,
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET,
    sortBy: CollectionSortField = 'dateAdded',
    sortOrder: SortOrder = DEFAULT_SORT_ORDER,
  ): Promise<[UserSuggestion[], number]> {
    this.logger.log(
      `Finding suggestions for user ${userId} sorted by ${sortBy} ${sortOrder}`,
    );

    return this.repository.findAndCount({
      where: { userId },
      relations: ['release'],
      take: limit,
      skip: offset,
      order: { [sortBy]: sortOrder },
    });
  }

  async findByUserAndRelease(
    userId: string,
    releaseId: number,
  ): Promise<UserSuggestion | null> {
    return this.repository.findOne({
      where: { userId, releaseId },
      relations: ['release'],
    });
  }

  async addToSuggestions(data: {
    userId: string;
    releaseId: number;
    notes?: string;
    dateAdded?: Date;
    title?: string;
    primaryArtist?: string;
    allArtists?: string;
    year?: number;
    primaryGenre?: string;
    primaryFormat?: string;
    vinylColor?: string;
  }): Promise<UserSuggestion> {
    this.logger.log(
      `Adding release ${data.releaseId} to user ${data.userId} suggestions`,
    );

    const suggestionItem = this.repository.create(data);
    return this.repository.save(suggestionItem);
  }

  async updateSuggestionItem(
    userId: string,
    releaseId: number,
    updates: Partial<UserSuggestion>,
  ): Promise<UserSuggestion | null> {
    await this.repository.update({ userId, releaseId }, updates);
    return this.findByUserAndRelease(userId, releaseId);
  }

  async removeFromSuggestions(
    userId: string,
    releaseId: number,
  ): Promise<void> {
    this.logger.log(
      `Removing release ${releaseId} from user ${userId} suggestions`,
    );
    await this.repository.delete({ userId, releaseId });
  }

  async removeOrphans(userId: string, activeDiscogsIds: number[]): Promise<number> {
    const itemsToRemove = await this.repository
      .createQueryBuilder('item')
      .innerJoin('item.release', 'release')
      .where('item.userId = :userId', { userId })
      .andWhere('release.discogsId NOT IN (:...ids)', { ids: activeDiscogsIds })
      .getMany();

    if (itemsToRemove.length === 0) return 0;

    await this.repository.remove(itemsToRemove);
    return itemsToRemove.length;
  }
}
