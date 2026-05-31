import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Release } from '../database/entities/release.entity';
import { ReleaseDataExtractor } from '../database/helpers/release-data-extractor';
import { BasicInformation } from '../discogs/types/discogs.types';

@Injectable()
export class ReleaseRepository {
  private readonly logger = new Logger(ReleaseRepository.name);

  constructor(
    @InjectRepository(Release)
    private readonly repository: Repository<Release>,
  ) {}

  async findByDiscogsId(discogsId: number): Promise<Release | null> {
    return this.repository.findOne({ where: { discogsId } });
  }

  async create(releaseData: Partial<Release>): Promise<Release> {
    const release = this.repository.create(releaseData);
    return this.repository.save(release);
  }

  async createFromDiscogs(basicInfo: BasicInformation): Promise<Release> {
    const sortableFields = ReleaseDataExtractor.extractSortableFields(basicInfo);

    const releaseData: Partial<Release> = {
      discogsId: basicInfo.id,
      title: basicInfo.title,
      year: basicInfo.year || undefined,
      thumbUrl: basicInfo.thumb || undefined,
      coverImageUrl: basicInfo.cover_image || undefined,
      artists: basicInfo.artists || [],
      labels: basicInfo.labels || [],
      formats: basicInfo.formats || [],
      genres: basicInfo.genres || [],
      styles: basicInfo.styles || [],
      ...sortableFields,
    } as Release;

    return this.create(releaseData);
  }

  async upsertFromDiscogs(basicInfo: BasicInformation): Promise<Release | null> {
    this.logger.log(`Upserting release from Discogs: ${basicInfo.title}`);

    const existing = await this.findByDiscogsId(basicInfo.id);
    const sortableFields = ReleaseDataExtractor.extractSortableFields(basicInfo);

    const releaseData: Partial<Release> = {
      discogsId: basicInfo.id,
      title: basicInfo.title,
      year: basicInfo.year || undefined,
      thumbUrl: basicInfo.thumb || undefined,
      coverImageUrl: basicInfo.cover_image || undefined,
      artists: basicInfo.artists || [],
      labels: basicInfo.labels || [],
      formats: basicInfo.formats || [],
      genres: basicInfo.genres || [],
      styles: basicInfo.styles || [],
      ...sortableFields,
    } as Release;

    if (existing) {
      await this.repository.update(existing.id, releaseData);
      return this.repository.findOne({ where: { id: existing.id } });
    } else {
      return this.create(releaseData);
    }
  }
}
