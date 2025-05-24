import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
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
    this.logger.log(`Finding release by discogsId: ${discogsId}`);
    return this.repository.findOne({
      where: { discogsId },
    });
  }

  async findByDiscogsIds(discogsIds: number[]): Promise<Release[]> {
    this.logger.log(`Finding releases by discogsIds: ${discogsIds.join(', ')}`);
    return this.repository.find({
      where: { discogsId: In(discogsIds) },
    });
  }

  async create(releaseData: Partial<Release>): Promise<Release> {
    this.logger.log(`Creating release: ${releaseData.title}`);
    const release = this.repository.create(releaseData);
    return this.repository.save(release);
  }

  async createFromDiscogs(basicInfo: BasicInformation): Promise<Release> {
    this.logger.log(`Creating release from Discogs: ${basicInfo.title}`);
    const sortableFields =
      ReleaseDataExtractor.extractSortableFields(basicInfo);

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

  async upsert(releaseData: Partial<Release>): Promise<Release | null> {
    if (!releaseData.discogsId)
      throw new Error('Upsert failed: No discogsId on release');

    this.logger.log(`Upserting release: ${releaseData.discogsId}`);
    const existing = await this.findByDiscogsId(releaseData.discogsId);

    if (existing) {
      await this.repository.update(existing.id, releaseData);
      return this.repository.findOne({ where: { id: existing.id } });
    } else {
      return this.create(releaseData);
    }
  }

  async upsertFromDiscogs(
    basicInfo: BasicInformation,
  ): Promise<Release | null> {
    this.logger.log(`Upserting release from Discogs: ${basicInfo.title}`);

    const existing = await this.findByDiscogsId(basicInfo.id);
    const sortableFields =
      ReleaseDataExtractor.extractSortableFields(basicInfo);

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

  async findAll(
    limit: number = 50,
    offset: number = 0,
  ): Promise<[Release[], number]> {
    this.logger.log(`findAll called with limit=${limit}, offset=${offset}`);

    try {
      const result = await this.repository.findAndCount({
        take: limit,
        skip: offset,
        order: { createdAt: 'DESC' },
      });

      this.logger.log(
        `findAll returned ${result[0].length} releases out of ${result[1]} total`,
      );
      return result;
    } catch (error) {
      this.logger.error('Error in findAll:', error);
      throw error;
    }
  }

  async findAllSorted(
    limit: number = 50,
    offset: number = 0,
    sortBy:
      | 'title'
      | 'primaryArtist'
      | 'year'
      | 'primaryGenre'
      | 'createdAt' = 'createdAt',
    sortOrder: 'ASC' | 'DESC' = 'DESC',
  ): Promise<[Release[], number]> {
    this.logger.log(
      `findAllSorted called with limit=${limit}, offset=${offset}, sortBy=${sortBy}, sortOrder=${sortOrder}`,
    );

    try {
      const result = await this.repository.findAndCount({
        take: limit,
        skip: offset,
        order: { [sortBy]: sortOrder },
      });

      this.logger.log(
        `findAllSorted returned ${result[0].length} releases out of ${result[1]} total`,
      );
      return result;
    } catch (error) {
      this.logger.error('Error in findAllSorted:', error);
      throw error;
    }
  }
}
