import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCollection } from '../database/entities/user-collection.entity';
import { UserWantlist } from '../database/entities/user-wantlist.entity';
import { Release } from '../database/entities/release.entity';
import { CollectionController } from './collection.controller';
import { CollectionService } from './collection.service';
import { UserCollectionRepository } from './repositories/user-collection.repository';
import { UserWantlistRepository } from './repositories/user-wantlist.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserCollection, UserWantlist, Release])],
  providers: [
    UserCollectionRepository,
    UserWantlistRepository,
    CollectionService,
  ],
  controllers: [CollectionController],
  exports: [
    UserCollectionRepository,
    UserWantlistRepository,
    CollectionService,
  ],
})
export class CollectionModule {}
