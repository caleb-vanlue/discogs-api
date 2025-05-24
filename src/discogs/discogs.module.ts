// discogs/discogs.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { DiscogsApiService } from './discogs-api.service';
import { DiscogsSyncService } from './discogs-sync.service';
import { SyncSchedulerService } from './sync-scheduler.service';
import { DiscogsController } from './discogs.controller';
import { ReleaseModule } from '../release/release.module';
import { CollectionModule } from '../collection/collection.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
    ConfigModule,
    ScheduleModule.forRoot(),
    ReleaseModule,
    CollectionModule,
  ],
  providers: [DiscogsApiService, DiscogsSyncService, SyncSchedulerService],
  controllers: [DiscogsController],
  exports: [DiscogsApiService, DiscogsSyncService, SyncSchedulerService],
})
export class DiscogsModule {}
