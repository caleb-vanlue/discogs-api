import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  CollectionResponse,
  WantlistResponse,
  DiscogsQueryParams,
  DiscogsRelease,
} from './types/discogs.types';
import { DiscogsConfig } from './discogs.config';
import { SearchReleasesResponse } from './dto/search-releases.dto';

@Injectable()
export class DiscogsApiService {
  private readonly logger = new Logger(DiscogsApiService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly discogsConfig: DiscogsConfig,
  ) {}

  private get discogsToken(): string {
    const token = this.discogsConfig.apiToken;
    if (!token) {
      throw new HttpException(
        'Discogs token not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return token;
  }

  private buildCollectionUrl(params: DiscogsQueryParams): string {
    const {
      folder = '0',
      sort = 'added',
      sortOrder = 'desc',
      page = 1,
      perPage = 50,
    } = params;

    return `${this.discogsConfig.baseUrl}/users/${this.discogsConfig.username}/collection/folders/${folder}/releases?sort=${sort}&sort_order=${sortOrder}&page=${page}&per_page=${perPage}`;
  }

  private buildWantlistUrl(params: DiscogsQueryParams): string {
    const { page = 1, perPage = 50 } = params;
    return `${this.discogsConfig.baseUrl}/users/${this.discogsConfig.username}/wants?page=${page}&per_page=${perPage}`;
  }

  private getRequestHeaders() {
    return {
      Authorization: `Discogs token=${this.discogsToken}`,
      'User-Agent': 'NestJSDiscogsService/1.0',
    };
  }

  async getCollection(
    params: DiscogsQueryParams = {},
  ): Promise<CollectionResponse> {
    try {
      const url = this.buildCollectionUrl(params);
      this.logger.debug(`Fetching collection from: ${url}`);

      const response = await firstValueFrom(
        this.httpService.get<CollectionResponse>(url, {
          headers: this.getRequestHeaders(),
        }),
      );

      this.logger.log(
        `Successfully fetched collection page ${params.page || 1}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error('Error fetching collection from Discogs:', error);

      if (error.response?.status) {
        throw new HttpException(
          `Discogs API error: ${error.response.status}`,
          error.response.status,
        );
      }

      throw new HttpException(
        'Failed to fetch collection',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getWantlist(
    params: DiscogsQueryParams = {},
  ): Promise<WantlistResponse> {
    try {
      const url = this.buildWantlistUrl(params);
      this.logger.debug(`Fetching wantlist from: ${url}`);

      const response = await firstValueFrom(
        this.httpService.get<WantlistResponse>(url, {
          headers: this.getRequestHeaders(),
        }),
      );

      this.logger.log(`Successfully fetched wantlist page ${params.page || 1}`);
      return response.data;
    } catch (error) {
      this.logger.error('Error fetching wantlist from Discogs:', error);

      if (error.response?.status) {
        throw new HttpException(
          `Discogs API error: ${error.response.status}`,
          error.response.status,
        );
      }

      throw new HttpException(
        'Failed to fetch wantlist',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllCollection(): Promise<DiscogsRelease[]> {
    const allReleases: DiscogsRelease[] = [];
    let page = 1;
    let totalPages = 1;

    this.logger.log('Fetching entire collection...');

    do {
      const response = await this.getCollection({ page, perPage: 100 });
      allReleases.push(...response.releases);
      totalPages = response.pagination.pages;
      page++;

      this.logger.log(
        `Fetched page ${page - 1}/${totalPages} (${response.releases.length} releases)`,
      );

      if (page <= totalPages) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } while (page <= totalPages);

    this.logger.log(
      `Fetched complete collection: ${allReleases.length} releases`,
    );
    return allReleases;
  }

  async getAllWantlist(): Promise<DiscogsRelease[]> {
    const allWants: DiscogsRelease[] = [];
    let page = 1;
    let totalPages = 1;

    this.logger.log('Fetching entire wantlist...');

    do {
      const response = await this.getWantlist({ page, perPage: 100 });
      allWants.push(...response.wants);
      totalPages = response.pagination.pages;
      page++;

      this.logger.log(
        `Fetched page ${page - 1}/${totalPages} (${response.wants.length} wants)`,
      );

      if (page <= totalPages) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } while (page <= totalPages);

    this.logger.log(`Fetched complete wantlist: ${allWants.length} wants`);
    return allWants;
  }

  async getAllSuggestions(): Promise<DiscogsRelease[]> {
    const allSuggestions: DiscogsRelease[] = [];
    let page = 1;
    let totalPages = 1;

    this.logger.log('Fetching entire suggestions folder...');

    do {
      const response = await this.getCollection({
        folder: '8797697',
        page,
        perPage: 100,
      });
      allSuggestions.push(...response.releases);
      totalPages = response.pagination.pages;
      page++;

      this.logger.log(
        `Fetched page ${page - 1}/${totalPages} (${response.releases.length} suggestions)`,
      );

      if (page <= totalPages) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } while (page <= totalPages);

    this.logger.log(
      `Fetched complete suggestions: ${allSuggestions.length} releases`,
    );
    return allSuggestions;
  }

  async searchReleases(
    query: string,
    page: number = 1,
    perPage: number = 50,
  ): Promise<SearchReleasesResponse> {
    try {
      const url = `${this.discogsConfig.baseUrl}/database/search`;
      const params = {
        q: query,
        type: 'release',
        page,
        per_page: perPage,
      };

      this.logger.debug(`Searching releases with query: ${query}`);

      const response = await firstValueFrom(
        this.httpService.get<SearchReleasesResponse>(url, {
          headers: this.getRequestHeaders(),
          params,
        }),
      );

      this.logger.log(
        `Search returned ${response.data.results.length} results for query: ${query}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error('Error searching releases on Discogs:', error);

      if (error.response?.status === 404) {
        return {
          results: [],
          pagination: {
            page,
            pages: 0,
            per_page: perPage,
            items: 0,
          },
        };
      }

      if (error.response?.status) {
        throw new HttpException(
          `Discogs API error: ${error.response.status}`,
          error.response.status,
        );
      }

      throw new HttpException(
        'Failed to search releases',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async addToFolder(
    releaseId: number,
    folderId: number = 8797697,
  ): Promise<{ instance_id: number }> {
    try {
      const url = `${this.discogsConfig.baseUrl}/users/${this.discogsConfig.username}/collection/folders/${folderId}/releases/${releaseId}`;

      this.logger.debug(`Adding release ${releaseId} to folder ${folderId}`);

      const response = await firstValueFrom(
        this.httpService.post<{ instance_id: number }>(
          url,
          {},
          {
            headers: this.getRequestHeaders(),
          },
        ),
      );

      this.logger.log(
        `Successfully added release ${releaseId} to folder ${folderId}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error('Error adding release to folder:', error);

      if (error.response?.status === 403) {
        throw new HttpException(
          'Release already exists in folder',
          HttpStatus.CONFLICT,
        );
      }

      if (error.response?.status) {
        throw new HttpException(
          `Discogs API error: ${error.response.status}`,
          error.response.status,
        );
      }

      throw new HttpException(
        'Failed to add release to folder',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
