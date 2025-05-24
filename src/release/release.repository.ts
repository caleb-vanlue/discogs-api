import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Release } from '../database/entities/release.entity';

@Injectable()
export class ReleaseRepository {
  constructor(
    @InjectRepository(Release)
    private readonly repository: Repository<Release>,
  ) {}

  async findByDiscogsId(discogsId: number): Promise<Release | null> {
    return this.repository.findOne({
      where: { discogsId },
    });
  }

  async findByDiscogsIds(discogsIds: number[]): Promise<Release[]> {
    return this.repository.find({
      where: { discogsId: { $in: discogsIds } as any },
    });
  }

  async create(releaseData: Partial<Release>): Promise<Release> {
    const release = this.repository.create(releaseData);
    return this.repository.save(release);
  }

  async upsert(releaseData: Partial<Release>): Promise<Release | null> {
    if (!releaseData.discogsId)
      throw new Error('Upsert failed: No discogsId on release');
    const existing = await this.findByDiscogsId(releaseData.discogsId);

    if (existing) {
      await this.repository.update(existing.id, releaseData);
      return this.repository.findOne({ where: { id: existing.id } });
    } else {
      return this.create(releaseData);
    }
  }

  async findAll(
    limit: number = 50,
    offset: number = 0,
  ): Promise<[Release[], number]> {
    return this.repository.findAndCount({
      take: limit,
      skip: offset,
      order: { createdAt: 'DESC' },
    });
  }
}
