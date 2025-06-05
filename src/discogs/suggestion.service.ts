import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DiscogsApiService } from './discogs-api.service';
import { DiscogsSyncService } from './discogs-sync.service';
import { UserSuggestionRepository } from '../collection/repositories/user-suggestion.repository';
import { ReleaseRepository } from '../release/release.repository';
import {
  CollectionSortField,
  SortOrder,
} from '../common/constants/sort.constants';

@Injectable()
export class SuggestionService {
  private readonly logger = new Logger(SuggestionService.name);

  constructor(
    private readonly discogsApiService: DiscogsApiService,
    private readonly discogsSyncService: DiscogsSyncService,
    private readonly suggestionRepo: UserSuggestionRepository,
    private readonly releaseRepo: ReleaseRepository,
  ) {}

  async addToSuggestions(
    userId: string,
    data: { releaseId: number; notes?: string },
  ) {
    // First, find the local release by Discogs ID
    const release = await this.releaseRepo.findByDiscogsId(data.releaseId);
    
    // Check if suggestion already exists (if release exists locally)
    if (release) {
      const existing = await this.suggestionRepo.findByUserAndRelease(
        userId,
        release.id,
      );

      if (existing) {
        throw new ConflictException('Release already in suggestions');
      }
    }

    try {
      this.logger.log(
        `Adding release ${data.releaseId} to Discogs suggestions folder and syncing`,
      );

      // Step 1: Add to Discogs folder
      await this.discogsApiService.addToFolder(data.releaseId);
      
      this.logger.log(
        `Successfully added release ${data.releaseId} to Discogs, now syncing suggestions`,
      );

      // Step 2: Sync the suggestions folder from Discogs to local database
      const syncResult = await this.discogsSyncService.syncUserSuggestions(userId);
      
      this.logger.log(
        `Suggestions sync completed: synced ${syncResult.synced}/${syncResult.total} suggestions`,
      );

      // Step 3: Find the release by Discogs ID to get the local database ID
      const release = await this.releaseRepo.findByDiscogsId(data.releaseId);
      
      if (!release) {
        throw new Error(`Release with Discogs ID ${data.releaseId} not found in database after sync`);
      }

      // Step 4: Return the newly added suggestion using the local database release ID
      const result = await this.suggestionRepo.findByUserAndRelease(
        userId,
        release.id,
      );

      if (!result) {
        throw new Error(`Failed to find suggestion for release ${release.id} (Discogs ID: ${data.releaseId}) after sync`);
      }

      return result;
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

  async getUserSuggestions(
    userId: string,
    limit?: number,
    offset?: number,
    sortBy?: string,
    sortOrder?: string,
  ) {
    // Use the same sort mapping logic as CollectionService
    const sortField = this.mapSortField(sortBy);
    const order = this.mapSortOrder(sortOrder);

    this.logger.log(
      `Getting suggestions for user ${userId} - sort: ${sortField} ${order}`,
    );

    const [items, total] = await this.suggestionRepo.findByUserIdSorted(
      userId,
      limit || 20,
      offset || 0,
      sortField,
      order,
    );

    return {
      data: items,
      total,
      limit: limit || 20,
      offset: offset || 0,
      hasMore: (offset || 0) + items.length < total,
      sortBy: sortField,
      sortOrder: order,
    };
  }

  async getUserSuggestionsStats(userId: string) {
    return await this.suggestionRepo.getSuggestionsStats(userId);
  }

  private mapSortField(sortBy?: string): CollectionSortField {
    const mapping: Record<string, CollectionSortField> = {
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