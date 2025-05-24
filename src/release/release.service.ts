import { Injectable, NotFoundException } from '@nestjs/common';
import { ReleaseRepository } from './release.repository';
import {
  ReleaseSortField,
  SortOrder,
  DEFAULT_LIMIT,
  DEFAULT_OFFSET,
  DEFAULT_SORT_ORDER,
} from '../common/constants/sort.constants';

@Injectable()
export class ReleaseService {
  constructor(private readonly releaseRepository: ReleaseRepository) {}

  async getReleases(
    limit?: number,
    offset?: number,
    sortBy?: ReleaseSortField,
    sortOrder?: string,
  ) {
    const order = this.mapSortOrder(sortOrder);
    const sortField = sortBy || 'createdAt';

    const [items, total] = await this.releaseRepository.findAllSorted(
      limit || DEFAULT_LIMIT,
      offset || DEFAULT_OFFSET,
      sortField,
      order,
    );

    return {
      data: items,
      total,
      limit: limit || DEFAULT_LIMIT,
      offset: offset || DEFAULT_OFFSET,
      hasMore: (offset || 0) + items.length < total,
      sortBy: sortField,
      sortOrder: order,
    };
  }

  async getReleaseByDiscogsId(discogsId: number) {
    const release = await this.releaseRepository.findByDiscogsId(discogsId);

    if (!release) {
      throw new NotFoundException(
        `Release with Discogs ID ${discogsId} not found`,
      );
    }

    return release;
  }

  private mapSortOrder(sortOrder?: string): SortOrder {
    const order = sortOrder?.toLowerCase();
    return order === 'asc' || order === 'ascending'
      ? 'ASC'
      : DEFAULT_SORT_ORDER;
  }
}
