import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Release } from './entities/release.entity';
import { UserCollection } from './entities/user-collection.entity';
import { UserWantlist } from './entities/user-wantlist.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
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
      }),
    }),
    TypeOrmModule.forFeature([Release, UserCollection, UserWantlist]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
