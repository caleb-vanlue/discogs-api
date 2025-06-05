import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCollection } from '../database/entities/user-collection.entity';
import { UserWantlist } from '../database/entities/user-wantlist.entity';
import { UserSuggestion } from '../database/entities/user-suggestion.entity';
import { Release } from '../database/entities/release.entity';
import { CollectionController } from './collection.controller';
import { CollectionService } from './collection.service';
import { UserCollectionRepository } from './repositories/user-collection.repository';
import { UserWantlistRepository } from './repositories/user-wantlist.repository';
import { UserSuggestionRepository } from './repositories/user-suggestion.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserCollection,
      UserWantlist,
      UserSuggestion,
      Release,
    ]),
  ],
  providers: [
    UserCollectionRepository,
    UserWantlistRepository,
    UserSuggestionRepository,
    CollectionService,
  ],
  controllers: [CollectionController],
  exports: [
    UserCollectionRepository,
    UserWantlistRepository,
    UserSuggestionRepository,
    CollectionService,
  ],
})
export class CollectionModule {}
