import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { DiscogsApiService } from './discogs-api.service';
import { DiscogsSyncService } from './discogs-sync.service';
import { SyncSchedulerService } from './sync-scheduler.service';
import { SuggestionService } from './suggestion.service';
import { DiscogsController } from './discogs.controller';
import { ReleaseModule } from '../release/release.module';
import { CollectionModule } from '../collection/collection.module';
import { DiscogsConfig } from './discogs.config';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
    ConfigModule,
    ScheduleModule.forRoot(),
    ReleaseModule,
    forwardRef(() => CollectionModule),
  ],
  providers: [
    DiscogsApiService,
    DiscogsSyncService,
    SuggestionService,
    DiscogsConfig,
    SyncSchedulerService,
  ],
  controllers: [DiscogsController],
  exports: [
    DiscogsApiService,
    DiscogsSyncService,
    SuggestionService,
    DiscogsConfig,
    SyncSchedulerService,
  ],
})
export class DiscogsModule {}
