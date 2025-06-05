import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Release } from './entities/release.entity';
import { UserCollection } from './entities/user-collection.entity';
import { UserWantlist } from './entities/user-wantlist.entity';
import { UserSuggestion } from './entities/user-suggestion.entity';

export const createDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('app.database.host'),
  port: configService.get<number>('app.database.port'),
  username: configService.get<string>('app.database.username'),
  password: configService.get<string>('app.database.password'),
  database: configService.get<string>('app.database.name'),
  entities: [Release, UserCollection, UserWantlist, UserSuggestion],
  migrations: ['dist/database/migrations/*.js'],
  migrationsRun: true,
  synchronize: false,
  logging: configService.get<string>('app.nodeEnv') === 'development',
});

export const createDataSourceConfig = (configService: ConfigService) => ({
  type: 'postgres' as const,
  host: configService.get<string>('app.database.host'),
  port: configService.get<number>('app.database.port'),
  username: configService.get<string>('app.database.username'),
  password: configService.get<string>('app.database.password'),
  database: configService.get<string>('app.database.name'),
  entities: ['src/database/entities/*.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: configService.get<string>('app.nodeEnv') === 'development',
});
