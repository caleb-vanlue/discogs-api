import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ReleaseModule } from './release/release.module';
import { CollectionModule } from './collection/collection.module';
import { DiscogsModule } from './discogs/discogs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    ReleaseModule,
    CollectionModule,
    DiscogsModule,
  ],
})
export class AppModule {}
