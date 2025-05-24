import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Release } from '../database/entities/release.entity';
import { ReleaseRepository } from './release.repository';
import { ReleaseController } from './release.controller';
import { ReleaseService } from './release.service';

@Module({
  imports: [TypeOrmModule.forFeature([Release])],
  providers: [ReleaseRepository, ReleaseService],
  controllers: [ReleaseController],
  exports: [ReleaseService, ReleaseRepository],
})
export class ReleaseModule {}
