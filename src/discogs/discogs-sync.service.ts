import { Injectable, Logger } from '@nestjs/common';
import { DiscogsApiService } from './discogs-api.service';
import { ReleaseRepository } from '../release/release.repository';
import { DiscogsRelease } from './types/discogs.types';
import { Release } from '../database/entities/release.entity';
import { ReleaseDataExtractor } from '../database/helpers/release-data-extractor';
import { UserCollectionRepository } from '../collection/repositories/user-collection.repository';
import { UserWantlistRepository } from '../collection/repositories/user-wantlist.repository';
import { DiscogsConfig } from './discogs.config';

@Injectable()
export class DiscogsSyncService {
  private readonly logger = new Logger(DiscogsSyncService.name);

  constructor(
    private readonly discogsApi: DiscogsApiService,
    private readonly releaseRepo: ReleaseRepository,
    private readonly collectionRepo: UserCollectionRepository,
    private readonly wantlistRepo: UserWantlistRepository,
    private readonly discogsConfig: DiscogsConfig,
  ) {}

  private processNotes(
    notes?: string | Array<{ field_id: number; value: string }>,
  ): string | null {
    if (!notes) return null;

    if (typeof notes === 'string') {
      return notes;
    }

    if (Array.isArray(notes)) {
      return notes.map((note) => note.value).join('\n');
    }

    return null;
  }

  private async syncRelease(discogsRelease: DiscogsRelease): Promise<Release> {
    const release = await this.releaseRepo.upsertFromDiscogs(
      discogsRelease.basic_information,
    );

    if (!release) {
      throw new Error(
        `Failed to sync release ${discogsRelease.basic_information.id}`,
      );
    }

    return release;
  }

  async syncUserCollection(
    userId: string = this.discogsConfig.username,
  ): Promise<{
    synced: number;
    errors: number;
    total: number;
  }> {
    this.logger.log(`Starting collection sync for user: ${userId}`);

    try {
      const discogsReleases = await this.discogsApi.getAllCollection();

      let synced = 0;
      let errors = 0;

      for (const discogsRelease of discogsReleases) {
        try {
          const release = await this.syncRelease(discogsRelease);
          const existing = await this.collectionRepo.findByUserAndRelease(
            userId,
            release.id,
          );

          const releaseDataForSorting =
            ReleaseDataExtractor.copyReleaseDataForSorting(release);

          if (!existing) {
            await this.collectionRepo.addToCollection({
              userId,
              releaseId: release.id,
              discogsInstanceId: discogsRelease.instance_id,
              folderId: discogsRelease.folder_id || 0,
              rating: discogsRelease.rating || 0,
              notes: this.processNotes(discogsRelease.notes) || '',
              dateAdded: discogsRelease.date_added
                ? new Date(discogsRelease.date_added)
                : new Date(),
              ...releaseDataForSorting,
            });

            synced++;
            this.logger.debug(`Synced release: ${release.title}`);
          } else {
            await this.collectionRepo.updateCollectionItem(userId, release.id, {
              rating: discogsRelease.rating || 0,
              notes: this.processNotes(discogsRelease.notes) || '',
              ...releaseDataForSorting,
            });

            synced++;
            this.logger.debug(`Updated release: ${release.title}`);
          }
        } catch (error) {
          this.logger.error(
            `Error syncing release ${discogsRelease.basic_information.title}:`,
            error,
          );
          errors++;
        }
      }

      const result = {
        synced,
        errors,
        total: discogsReleases.length,
      };

      this.logger.log(`Collection sync completed: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error('Collection sync failed:', error);
      throw error;
    }
  }

  async syncUserWantlist(
    userId: string = this.discogsConfig.username,
  ): Promise<{
    synced: number;
    errors: number;
    total: number;
  }> {
    this.logger.log(`Starting wantlist sync for user: ${userId}`);

    try {
      const discogsWants = await this.discogsApi.getAllWantlist();

      let synced = 0;
      let errors = 0;

      for (const discogsWant of discogsWants) {
        try {
          const release = await this.syncRelease(discogsWant);
          const existing = await this.wantlistRepo.findByUserAndRelease(
            userId,
            release.id,
          );

          const releaseDataForSorting =
            ReleaseDataExtractor.copyReleaseDataForSorting(release);

          if (!existing) {
            await this.wantlistRepo.addToWantlist({
              userId,
              releaseId: release.id,
              notes: this.processNotes(discogsWant.notes) || '',
              dateAdded: discogsWant.date_added
                ? new Date(discogsWant.date_added)
                : new Date(),
              ...releaseDataForSorting,
            });

            synced++;
            this.logger.debug(`Synced want: ${release.title}`);
          } else {
            await this.wantlistRepo.updateWantlistItem(userId, release.id, {
              notes: this.processNotes(discogsWant.notes) || '',
              ...releaseDataForSorting,
            });

            synced++;
            this.logger.debug(`Updated want: ${release.title}`);
          }
        } catch (error) {
          this.logger.error(
            `Error syncing want ${discogsWant.basic_information.title}:`,
            error,
          );
          errors++;
        }
      }

      const result = {
        synced,
        errors,
        total: discogsWants.length,
      };

      this.logger.log(`Wantlist sync completed: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error('Wantlist sync failed:', error);
      throw error;
    }
  }

  async syncAll(userId: string = this.discogsConfig.username): Promise<{
    collection: { synced: number; errors: number; total: number };
    wantlist: { synced: number; errors: number; total: number };
  }> {
    this.logger.log(`Starting full sync for user: ${userId}`);

    const [collectionResult, wantlistResult] = await Promise.all([
      this.syncUserCollection(userId),
      this.syncUserWantlist(userId),
    ]);

    const result = {
      collection: collectionResult,
      wantlist: wantlistResult,
    };

    this.logger.log(`Full sync completed: ${JSON.stringify(result)}`);
    return result;
  }

  async getSyncStatus(userId: string = this.discogsConfig.username) {
    const [collectionStats, wantlistStats] = await Promise.all([
      this.collectionRepo.getCollectionStats(userId),
      this.wantlistRepo.getWantlistStats(userId),
    ]);

    return {
      userId,
      lastSyncAttempt: new Date().toISOString(),
      collection: {
        totalItems: collectionStats.totalItems,
        ratedItems: collectionStats.ratedItems,
        averageRating: collectionStats.averageRating,
      },
      wantlist: {
        totalItems: wantlistStats.totalItems,
      },
      summary: {
        totalSyncedItems: collectionStats.totalItems + wantlistStats.totalItems,
      },
    };
  }
}
