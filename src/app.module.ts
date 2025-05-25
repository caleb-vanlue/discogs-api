import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ReleaseModule } from './release/release.module';
import { CollectionModule } from './collection/collection.module';
import { DiscogsModule } from './discogs/discogs.module';
import configuration from './config/configuration';
import { validate } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),
    DatabaseModule,
    ReleaseModule,
    CollectionModule,
    DiscogsModule,
  ],
})
export class AppModule {}
