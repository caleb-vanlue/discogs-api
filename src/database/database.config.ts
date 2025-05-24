import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Release } from './entities/release.entity';
import { UserCollection } from './entities/user-collection.entity';
import { UserWantlist } from './entities/user-wantlist.entity';

export const createDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('DB_HOST', 'localhost'),
  port: configService.get('DB_PORT', 5432),
  username: configService.get('DB_USERNAME', 'postgres'),
  password: configService.get('DB_PASSWORD', 'password'),
  database: configService.get('DB_NAME', 'discogs'),
  entities: [Release, UserCollection, UserWantlist],
  migrations: ['dist/database/migrations/*.js'],
  migrationsRun: true,
  synchronize: false,
  logging: configService.get('NODE_ENV') === 'development',
});

export const createDataSourceConfig = (configService: ConfigService) => ({
  type: 'postgres' as const,
  host: configService.get('DB_HOST', 'localhost'),
  port: configService.get('DB_PORT', 5432),
  username: configService.get('DB_USERNAME', 'postgres'),
  password: configService.get('DB_PASSWORD', 'password'),
  database: configService.get('DB_NAME', 'discogs'),
  entities: [Release, UserCollection, UserWantlist],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: configService.get('NODE_ENV') === 'development',
});
