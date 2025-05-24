import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserWantlist } from '../../database/entities/user-wantlist.entity';

export type WantlistSortField =
  | 'dateAdded'
  | 'title'
  | 'primaryArtist'
  | 'year'
  | 'primaryGenre'
  | 'primaryFormat';
export type SortOrder = 'ASC' | 'DESC';

@Injectable()
export class UserWantlistRepository {
  private readonly logger = new Logger(UserWantlistRepository.name);

  constructor(
    @InjectRepository(UserWantlist)
    private readonly repository: Repository<UserWantlist>,
  ) {}

  async findByUserId(
    userId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<[UserWantlist[], number]> {
    this.logger.log(`Finding wantlist for user ${userId}`);

    return this.repository.findAndCount({
      where: { userId },
      relations: ['release'],
      take: limit,
      skip: offset,
      order: { dateAdded: 'DESC' },
    });
  }

  // NEW: Method with sorting support
  async findByUserIdSorted(
    userId: string,
    limit: number = 50,
    offset: number = 0,
    sortBy: WantlistSortField = 'dateAdded',
    sortOrder: SortOrder = 'DESC',
  ): Promise<[UserWantlist[], number]> {
    this.logger.log(
      `Finding wantlist for user ${userId} sorted by ${sortBy} ${sortOrder}`,
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
  ): Promise<UserWantlist | null> {
    return this.repository.findOne({
      where: { userId, releaseId },
      relations: ['release'],
    });
  }

  async addToWantlist(data: {
    userId: string;
    releaseId: number;
    notes?: string;
    dateAdded?: Date;
    // NEW: Add sortable fields
    title?: string;
    primaryArtist?: string;
    allArtists?: string;
    year?: number;
    primaryGenre?: string;
    primaryFormat?: string;
    vinylColor?: string;
  }): Promise<UserWantlist> {
    this.logger.log(
      `Adding release ${data.releaseId} to user ${data.userId} wantlist`,
    );

    const wantlistItem = this.repository.create(data);
    return this.repository.save(wantlistItem);
  }

  async updateWantlistItem(
    userId: string,
    releaseId: number,
    updates: Partial<UserWantlist>,
  ): Promise<UserWantlist | null> {
    await this.repository.update({ userId, releaseId }, updates);
    return this.findByUserAndRelease(userId, releaseId);
  }

  async removeFromWantlist(userId: string, releaseId: number): Promise<void> {
    this.logger.log(
      `Removing release ${releaseId} from user ${userId} wantlist`,
    );
    await this.repository.delete({ userId, releaseId });
  }

  async getWantlistStats(userId: string) {
    const total = await this.repository.count({
      where: { userId },
    });

    return {
      totalItems: total,
    };
  }

  // NEW: Get available sort options
  getAvailableSortOptions(): { field: WantlistSortField; label: string }[] {
    return [
      { field: 'dateAdded', label: 'Date Added' },
      { field: 'title', label: 'Title' },
      { field: 'primaryArtist', label: 'Artist' },
      { field: 'year', label: 'Year' },
      { field: 'primaryGenre', label: 'Genre' },
      { field: 'primaryFormat', label: 'Format' },
    ];
  }
}
