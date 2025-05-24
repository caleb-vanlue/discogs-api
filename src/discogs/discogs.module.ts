// discogs/discogs.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { DiscogsApiService } from './discogs-api.service';
import { DiscogsSyncService } from './discogs-sync.service';
import { DiscogsController } from './discogs.controller';
import { ReleaseModule } from '../release/release.module';
import { CollectionModule } from '../collection/collection.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    ConfigModule,
    ReleaseModule,
    CollectionModule,
  ],
  providers: [DiscogsApiService, DiscogsSyncService],
  controllers: [DiscogsController],
  exports: [DiscogsApiService, DiscogsSyncService],
})
export class DiscogsModule {}
