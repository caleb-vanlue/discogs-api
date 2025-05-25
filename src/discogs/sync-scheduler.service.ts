import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { DiscogsSyncService } from './discogs-sync.service';
import { DiscogsConfig } from './discogs.config';

@Injectable()
export class SyncSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SyncSchedulerService.name);

  constructor(
    private readonly syncService: DiscogsSyncService,
    private readonly configService: ConfigService,
    private readonly discogsConfig: DiscogsConfig,
  ) {}

  async onModuleInit() {
    const syncOnStartup =
      this.configService.get('SYNC_ON_STARTUP', 'true') === 'true';

    if (!syncOnStartup) {
      this.logger.log('Startup sync disabled via SYNC_ON_STARTUP=false');
      return;
    }

    this.logger.log('Application started - Beginning initial sync...');

    try {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      await this.performFullSync('startup');
    } catch (error) {
      this.logger.error('Startup sync failed:', error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'daily-discogs-sync',
    timeZone: 'UTC',
  })
  async handleDailySync() {
    const cronEnabled =
      this.configService.get('CRON_SYNC_ENABLED', 'true') === 'true';

    if (!cronEnabled) {
      this.logger.log('Daily sync disabled via CRON_SYNC_ENABLED=false');
      return;
    }

    this.logger.log('Daily sync triggered at midnight UTC');

    try {
      await this.performFullSync('daily-cron');
    } catch (error) {
      this.logger.error('Daily sync failed:', error);
    }
  }

  private async performFullSync(trigger: string) {
    const startTime = Date.now();
    this.logger.log(`Starting full sync (trigger: ${trigger})`);

    try {
      const result = await this.syncService.syncAll(
        this.discogsConfig.username,
      );

      const duration = Date.now() - startTime;
      const durationMinutes = Math.round((duration / 1000 / 60) * 100) / 100;

      this.logger.log(
        `Sync completed successfully in ${durationMinutes} minutes`,
      );
      this.logger.log(
        `Results: Collection: ${result.collection.synced}/${result.collection.total}, Wantlist: ${result.wantlist.synced}/${result.wantlist.total}`,
      );

      if (result.collection.errors > 0 || result.wantlist.errors > 0) {
        this.logger.warn(
          `Sync completed with errors: Collection: ${result.collection.errors}, Wantlist: ${result.wantlist.errors}`,
        );
      }

      return {
        success: true,
        trigger,
        duration: durationMinutes,
        ...result,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const durationMinutes = Math.round((duration / 1000 / 60) * 100) / 100;

      this.logger.error(`Sync failed after ${durationMinutes} minutes:`, error);

      throw {
        success: false,
        trigger,
        duration: durationMinutes,
        error: error.message,
      };
    }
  }
}
