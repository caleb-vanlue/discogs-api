import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Release } from '../database/entities/release.entity';
import { ReleaseRepository } from './release.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Release])],
  providers: [ReleaseRepository],
  exports: [ReleaseRepository],
})
export class ReleaseModule {}
