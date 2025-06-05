import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { DiscogsApiService } from '../discogs-api.service';
import { DiscogsConfig } from '../discogs.config';
import {
  CollectionResponse,
  WantlistResponse,
  DiscogsQueryParams,
  DiscogsRelease,
  BasicInformation,
} from '../types/discogs.types';

describe('DiscogsApiService', () => {
  let service: DiscogsApiService;
  let httpService: HttpService;
  let discogsConfig: DiscogsConfig;

  const mockDiscogsConfig = {
    apiToken: 'test-token-123',
    username: 'test-user',
    baseUrl: 'https://api.discogs.com',
  };

  const mockHttpService = {
    get: jest.fn(),
    post: jest.fn(),
  };

  const mockBasicInformation: BasicInformation = {
    id: 123,
    title: 'Test Album',
    year: 2023,
    thumb: 'https://example.com/thumb.jpg',
    cover_image: 'https://example.com/cover.jpg',
    artists: [
      {
        name: 'Test Artist',
        anv: 'Test Artist',
      },
    ],
    labels: [
      {
        name: 'Test Label',
        catno: 'TL001',
      },
    ],
    formats: [
      {
        name: 'Vinyl',
        qty: '1',
        descriptions: ['LP', '12"'],
        text: 'Test format text',
      },
    ],
    genres: ['Rock'],
    styles: ['Alternative Rock'],
  };

  const mockDiscogsRelease: DiscogsRelease = {
    id: 123,
    instance_id: 456,
    rating: 5,
    basic_information: mockBasicInformation,
    notes: 'Test notes',
    date_added: '2023-01-01T00:00:00-00:00',
    folder_id: 0,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscogsApiService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: DiscogsConfig,
          useValue: mockDiscogsConfig,
        },
      ],
    })
      .setLogger({
        log: () => {},
        error: () => {},
        warn: () => {},
        debug: () => {},
        verbose: () => {},
      })
      .compile();

    service = module.get<DiscogsApiService>(DiscogsApiService);
    httpService = module.get<HttpService>(HttpService);
    discogsConfig = module.get<DiscogsConfig>(DiscogsConfig);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('discogsToken getter', () => {
    it('should return token when configured', () => {
      expect(service['discogsToken']).toBe('test-token-123');
    });

    it('should throw HttpException when token not configured', async () => {
      const configWithoutToken = { ...mockDiscogsConfig, apiToken: undefined };
      const moduleWithoutToken = await Test.createTestingModule({
        providers: [
          DiscogsApiService,
          {
            provide: HttpService,
            useValue: mockHttpService,
          },
          {
            provide: DiscogsConfig,
            useValue: configWithoutToken,
          },
        ],
      })
        .setLogger({
          log: () => {},
          error: () => {},
          warn: () => {},
          debug: () => {},
          verbose: () => {},
        })
        .compile();

      const serviceWithoutToken =
        moduleWithoutToken.get<DiscogsApiService>(DiscogsApiService);
      expect(() => serviceWithoutToken['discogsToken']).toThrow(
        new HttpException(
          'Discogs token not configured',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('buildCollectionUrl', () => {
    it('should build URL with default parameters', () => {
      const params: DiscogsQueryParams = {};
      const url = service['buildCollectionUrl'](params);

      expect(url).toBe(
        'https://api.discogs.com/users/test-user/collection/folders/1/releases?sort=added&sort_order=desc&page=1&per_page=50',
      );
    });

    it('should build URL with custom parameters', () => {
      const params: DiscogsQueryParams = {
        folder: '1',
        sort: 'artist',
        sortOrder: 'asc',
        page: 2,
        perPage: 100,
      };
      const url = service['buildCollectionUrl'](params);

      expect(url).toBe(
        'https://api.discogs.com/users/test-user/collection/folders/1/releases?sort=artist&sort_order=asc&page=2&per_page=100',
      );
    });

    it('should handle all valid sort options', () => {
      const sortOptions: Array<DiscogsQueryParams['sort']> = [
        'artist',
        'title',
        'rating',
        'added',
        'year',
      ];

      sortOptions.forEach((sort) => {
        const params: DiscogsQueryParams = { sort };
        const url = service['buildCollectionUrl'](params);
        expect(url).toContain(`sort=${sort}`);
      });
    });
  });

  describe('buildWantlistUrl', () => {
    it('should build URL with default parameters', () => {
      const params: DiscogsQueryParams = {};
      const url = service['buildWantlistUrl'](params);

      expect(url).toBe(
        'https://api.discogs.com/users/test-user/wants?page=1&per_page=50',
      );
    });

    it('should build URL with custom parameters', () => {
      const params: DiscogsQueryParams = {
        page: 3,
        perPage: 25,
      };
      const url = service['buildWantlistUrl'](params);

      expect(url).toBe(
        'https://api.discogs.com/users/test-user/wants?page=3&per_page=25',
      );
    });
  });

  describe('getRequestHeaders', () => {
    it('should return correct headers', () => {
      const headers = service['getRequestHeaders']();

      expect(headers).toEqual({
        Authorization: 'Discogs token=test-token-123',
        'User-Agent': 'NestJSDiscogsService/1.0',
      });
    });
  });

  describe('getCollection', () => {
    const mockCollectionResponse: CollectionResponse = {
      pagination: {
        page: 1,
        pages: 10,
        per_page: 50,
        items: 500,
      },
      releases: [mockDiscogsRelease],
    };

    it('should fetch collection successfully with default parameters', async () => {
      mockHttpService.get.mockReturnValue(of({ data: mockCollectionResponse }));

      const result = await service.getCollection();

      expect(result).toEqual(mockCollectionResponse);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        'https://api.discogs.com/users/test-user/collection/folders/1/releases?sort=added&sort_order=desc&page=1&per_page=50',
        {
          headers: {
            Authorization: 'Discogs token=test-token-123',
            'User-Agent': 'NestJSDiscogsService/1.0',
          },
        },
      );
    });

    it('should fetch collection with custom parameters', async () => {
      mockHttpService.get.mockReturnValue(of({ data: mockCollectionResponse }));

      const params: DiscogsQueryParams = {
        page: 2,
        perPage: 25,
        sort: 'artist',
        sortOrder: 'asc',
        folder: '1',
      };

      await service.getCollection(params);

      expect(mockHttpService.get).toHaveBeenCalledWith(
        'https://api.discogs.com/users/test-user/collection/folders/1/releases?sort=artist&sort_order=asc&page=2&per_page=25',
        {
          headers: {
            Authorization: 'Discogs token=test-token-123',
            'User-Agent': 'NestJSDiscogsService/1.0',
          },
        },
      );
    });

    it('should handle HTTP errors with status code', async () => {
      const error = {
        response: {
          status: 401,
        },
      };
      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(service.getCollection()).rejects.toThrow(
        new HttpException('Discogs API error: 401', 401),
      );
    });

    it('should handle generic network errors', async () => {
      const error = new Error('Network error');
      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(service.getCollection()).rejects.toThrow(
        new HttpException(
          'Failed to fetch collection',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });

    it('should log debug message when fetching collection', async () => {
      const loggerSpy = jest.spyOn(service['logger'], 'debug');
      mockHttpService.get.mockReturnValue(of({ data: mockCollectionResponse }));

      await service.getCollection();

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Fetching collection from:'),
      );
    });

    it('should log success message after fetching collection', async () => {
      const loggerSpy = jest.spyOn(service['logger'], 'log');
      mockHttpService.get.mockReturnValue(of({ data: mockCollectionResponse }));

      await service.getCollection({ page: 2 });

      expect(loggerSpy).toHaveBeenCalledWith(
        'Successfully fetched collection page 2',
      );
    });
  });

  describe('getWantlist', () => {
    const mockWantlistResponse: WantlistResponse = {
      pagination: {
        page: 1,
        pages: 5,
        per_page: 50,
        items: 250,
      },
      wants: [mockDiscogsRelease],
    };

    it('should fetch wantlist successfully with default parameters', async () => {
      mockHttpService.get.mockReturnValue(of({ data: mockWantlistResponse }));

      const result = await service.getWantlist();

      expect(result).toEqual(mockWantlistResponse);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        'https://api.discogs.com/users/test-user/wants?page=1&per_page=50',
        {
          headers: {
            Authorization: 'Discogs token=test-token-123',
            'User-Agent': 'NestJSDiscogsService/1.0',
          },
        },
      );
    });

    it('should fetch wantlist with custom parameters', async () => {
      mockHttpService.get.mockReturnValue(of({ data: mockWantlistResponse }));

      const params: DiscogsQueryParams = {
        page: 3,
        perPage: 100,
      };

      await service.getWantlist(params);

      expect(mockHttpService.get).toHaveBeenCalledWith(
        'https://api.discogs.com/users/test-user/wants?page=3&per_page=100',
        {
          headers: {
            Authorization: 'Discogs token=test-token-123',
            'User-Agent': 'NestJSDiscogsService/1.0',
          },
        },
      );
    });

    it('should handle rate limiting (429) errors', async () => {
      const error = {
        response: {
          status: 429,
        },
      };
      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(service.getWantlist()).rejects.toThrow(
        new HttpException('Discogs API error: 429', 429),
      );
    });

    it('should log debug and success messages', async () => {
      const debugSpy = jest.spyOn(service['logger'], 'debug');
      const logSpy = jest.spyOn(service['logger'], 'log');
      mockHttpService.get.mockReturnValue(of({ data: mockWantlistResponse }));

      await service.getWantlist({ page: 3 });

      expect(debugSpy).toHaveBeenCalledWith(
        expect.stringContaining('Fetching wantlist from:'),
      );
      expect(logSpy).toHaveBeenCalledWith(
        'Successfully fetched wantlist page 3',
      );
    });
  });

  describe('getAllCollection', () => {
    it('should fetch all collection pages successfully', async () => {
      const page1Response: CollectionResponse = {
        pagination: { page: 1, pages: 2, per_page: 100, items: 150 },
        releases: [
          {
            ...mockDiscogsRelease,
            id: 1,
            basic_information: {
              ...mockBasicInformation,
              id: 1,
              title: 'Album 1',
            },
          },
        ],
      };

      const page2Response: CollectionResponse = {
        pagination: { page: 2, pages: 2, per_page: 100, items: 150 },
        releases: [
          {
            ...mockDiscogsRelease,
            id: 2,
            basic_information: {
              ...mockBasicInformation,
              id: 2,
              title: 'Album 2',
            },
          },
        ],
      };

      mockHttpService.get
        .mockReturnValueOnce(of({ data: page1Response }))
        .mockReturnValueOnce(of({ data: page2Response }));

      // Mock setTimeout to avoid actual delays in tests
      jest.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
        callback();
        return {} as any;
      });

      const result = await service.getAllCollection();

      expect(result).toHaveLength(2);
      expect(result[0].basic_information.title).toBe('Album 1');
      expect(result[1].basic_information.title).toBe('Album 2');
      expect(mockHttpService.get).toHaveBeenCalledTimes(2);

      // Restore setTimeout
      jest.restoreAllMocks();
    });

    it('should handle single page collection', async () => {
      const singlePageResponse: CollectionResponse = {
        pagination: { page: 1, pages: 1, per_page: 100, items: 1 },
        releases: [mockDiscogsRelease],
      };

      mockHttpService.get.mockReturnValue(of({ data: singlePageResponse }));

      const result = await service.getAllCollection();

      expect(result).toHaveLength(1);
      expect(mockHttpService.get).toHaveBeenCalledTimes(1);
    });

    it('should log progress messages during pagination', async () => {
      const logSpy = jest.spyOn(service['logger'], 'log');
      const singlePageResponse: CollectionResponse = {
        pagination: { page: 1, pages: 1, per_page: 100, items: 1 },
        releases: [mockDiscogsRelease],
      };

      mockHttpService.get.mockReturnValue(of({ data: singlePageResponse }));

      await service.getAllCollection();

      expect(logSpy).toHaveBeenCalledWith('Fetching entire collection from Uncategorized folder...');
      expect(logSpy).toHaveBeenCalledWith('Fetched page 1/1 (1 releases)');
      expect(logSpy).toHaveBeenCalledWith(
        'Fetched complete collection: 1 releases',
      );
    });
  });

  describe('getAllWantlist', () => {
    it('should fetch all wantlist pages successfully', async () => {
      const page1Response: WantlistResponse = {
        pagination: { page: 1, pages: 2, per_page: 100, items: 150 },
        wants: [
          {
            ...mockDiscogsRelease,
            id: 1,
            basic_information: {
              ...mockBasicInformation,
              id: 1,
              title: 'Want 1',
            },
          },
        ],
      };

      const page2Response: WantlistResponse = {
        pagination: { page: 2, pages: 2, per_page: 100, items: 150 },
        wants: [
          {
            ...mockDiscogsRelease,
            id: 2,
            basic_information: {
              ...mockBasicInformation,
              id: 2,
              title: 'Want 2',
            },
          },
        ],
      };

      mockHttpService.get
        .mockReturnValueOnce(of({ data: page1Response }))
        .mockReturnValueOnce(of({ data: page2Response }));

      // Mock setTimeout
      jest.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
        callback();
        return {} as any;
      });

      const result = await service.getAllWantlist();

      expect(result).toHaveLength(2);
      expect(result[0].basic_information.title).toBe('Want 1');
      expect(result[1].basic_information.title).toBe('Want 2');
      expect(mockHttpService.get).toHaveBeenCalledTimes(2);

      // Restore setTimeout
      jest.restoreAllMocks();
    });

    it('should log progress messages', async () => {
      const logSpy = jest.spyOn(service['logger'], 'log');
      const singlePageResponse: WantlistResponse = {
        pagination: { page: 1, pages: 1, per_page: 100, items: 1 },
        wants: [mockDiscogsRelease],
      };

      mockHttpService.get.mockReturnValue(of({ data: singlePageResponse }));

      await service.getAllWantlist();

      expect(logSpy).toHaveBeenCalledWith('Fetching entire wantlist...');
      expect(logSpy).toHaveBeenCalledWith('Fetched page 1/1 (1 wants)');
      expect(logSpy).toHaveBeenCalledWith('Fetched complete wantlist: 1 wants');
    });

    it('should handle empty wantlist', async () => {
      const emptyResponse: WantlistResponse = {
        pagination: { page: 1, pages: 1, per_page: 100, items: 0 },
        wants: [],
      };

      mockHttpService.get.mockReturnValue(of({ data: emptyResponse }));

      const result = await service.getAllWantlist();

      expect(result).toHaveLength(0);
    });
  });

  describe('error handling', () => {
    it('should log errors when fetching collection fails', async () => {
      const errorSpy = jest.spyOn(service['logger'], 'error');
      const error = new Error('Test error');
      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(service.getCollection()).rejects.toThrow();

      expect(errorSpy).toHaveBeenCalledWith(
        'Error fetching collection from Discogs:',
        error,
      );
    });

    it('should log errors when fetching wantlist fails', async () => {
      const errorSpy = jest.spyOn(service['logger'], 'error');
      const error = new Error('Test error');
      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(service.getWantlist()).rejects.toThrow();

      expect(errorSpy).toHaveBeenCalledWith(
        'Error fetching wantlist from Discogs:',
        error,
      );
    });
  });

  describe('searchReleases', () => {
    const mockSearchResponse = {
      results: [
        {
          id: 12345,
          title: 'Test Album',
          artist: 'Test Artist',
          year: 2023,
          thumb: 'https://example.com/thumb.jpg',
          cover_image: 'https://example.com/cover.jpg',
          format: ['CD', 'Album'],
          resource_url: 'https://api.discogs.com/releases/12345',
        },
      ],
      pagination: {
        page: 1,
        pages: 5,
        per_page: 50,
        items: 250,
      },
    };

    it('should search releases successfully', async () => {
      mockHttpService.get.mockReturnValue(of({ data: mockSearchResponse }));

      const result = await service.searchReleases('Pink Floyd');

      expect(result).toEqual(mockSearchResponse);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        'https://api.discogs.com/database/search',
        {
          headers: {
            Authorization: 'Discogs token=test-token-123',
            'User-Agent': 'NestJSDiscogsService/1.0',
          },
          params: {
            q: 'Pink Floyd',
            type: 'release',
            page: 1,
            per_page: 50,
          },
        },
      );
    });

    it('should search with custom pagination', async () => {
      mockHttpService.get.mockReturnValue(of({ data: mockSearchResponse }));

      await service.searchReleases('Beatles', 2, 25);

      expect(mockHttpService.get).toHaveBeenCalledWith(
        'https://api.discogs.com/database/search',
        {
          headers: {
            Authorization: 'Discogs token=test-token-123',
            'User-Agent': 'NestJSDiscogsService/1.0',
          },
          params: {
            q: 'Beatles',
            type: 'release',
            page: 2,
            per_page: 25,
          },
        },
      );
    });

    it('should return empty results on 404', async () => {
      const error = {
        response: {
          status: 404,
        },
      };
      mockHttpService.get.mockReturnValue(throwError(() => error));

      const result = await service.searchReleases('NonexistentAlbum');

      expect(result).toEqual({
        results: [],
        pagination: {
          page: 1,
          pages: 0,
          per_page: 50,
          items: 0,
        },
      });
    });

    it('should handle API errors', async () => {
      const error = {
        response: {
          status: 401,
        },
      };
      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(service.searchReleases('Test')).rejects.toThrow(
        new HttpException('Discogs API error: 401', 401),
      );
    });

    it('should handle network errors', async () => {
      const error = new Error('Network error');
      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(service.searchReleases('Test')).rejects.toThrow(
        new HttpException(
          'Failed to search releases',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });

    it('should log search operations', async () => {
      const debugSpy = jest.spyOn(service['logger'], 'debug');
      const logSpy = jest.spyOn(service['logger'], 'log');
      mockHttpService.get.mockReturnValue(of({ data: mockSearchResponse }));

      await service.searchReleases('Test Query');

      expect(debugSpy).toHaveBeenCalledWith(
        'Searching releases with query: Test Query',
      );
      expect(logSpy).toHaveBeenCalledWith(
        'Search returned 1 results for query: Test Query',
      );
    });

    it('should log errors on search failure', async () => {
      const errorSpy = jest.spyOn(service['logger'], 'error');
      const error = new Error('Search failed');
      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(service.searchReleases('Test')).rejects.toThrow();

      expect(errorSpy).toHaveBeenCalledWith(
        'Error searching releases on Discogs:',
        error,
      );
    });
  });

  describe('addToFolder', () => {
    const mockAddResponse = { instance_id: 999999 };

    it('should add release to folder successfully', async () => {
      mockHttpService.post.mockReturnValue(of({ data: mockAddResponse }));

      const result = await service.addToFolder(12345);

      expect(result).toEqual(mockAddResponse);
      expect(mockHttpService.post).toHaveBeenCalledWith(
        'https://api.discogs.com/users/test-user/collection/folders/8797697/releases/12345',
        {},
        {
          headers: {
            Authorization: 'Discogs token=test-token-123',
            'User-Agent': 'NestJSDiscogsService/1.0',
          },
        },
      );
    });

    it('should add release to custom folder', async () => {
      mockHttpService.post.mockReturnValue(of({ data: mockAddResponse }));

      await service.addToFolder(67890, 123);

      expect(mockHttpService.post).toHaveBeenCalledWith(
        'https://api.discogs.com/users/test-user/collection/folders/123/releases/67890',
        {},
        {
          headers: {
            Authorization: 'Discogs token=test-token-123',
            'User-Agent': 'NestJSDiscogsService/1.0',
          },
        },
      );
    });

    it('should handle conflict error (release already exists)', async () => {
      const error = {
        response: {
          status: 403,
        },
      };
      mockHttpService.post.mockReturnValue(throwError(() => error));

      await expect(service.addToFolder(12345)).rejects.toThrow(
        new HttpException(
          'Release already exists in folder',
          HttpStatus.CONFLICT,
        ),
      );
    });

    it('should handle other API errors', async () => {
      const error = {
        response: {
          status: 401,
        },
      };
      mockHttpService.post.mockReturnValue(throwError(() => error));

      await expect(service.addToFolder(12345)).rejects.toThrow(
        new HttpException('Discogs API error: 401', 401),
      );
    });

    it('should handle network errors', async () => {
      const error = new Error('Network error');
      mockHttpService.post.mockReturnValue(throwError(() => error));

      await expect(service.addToFolder(12345)).rejects.toThrow(
        new HttpException(
          'Failed to add release to folder',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });

    it('should log add operations', async () => {
      const debugSpy = jest.spyOn(service['logger'], 'debug');
      const logSpy = jest.spyOn(service['logger'], 'log');
      mockHttpService.post.mockReturnValue(of({ data: mockAddResponse }));

      await service.addToFolder(12345);

      expect(debugSpy).toHaveBeenCalledWith(
        'Adding release 12345 to folder 8797697',
      );
      expect(logSpy).toHaveBeenCalledWith(
        'Successfully added release 12345 to folder 8797697',
      );
    });

    it('should log errors on add failure', async () => {
      const errorSpy = jest.spyOn(service['logger'], 'error');
      const error = new Error('Add failed');
      mockHttpService.post.mockReturnValue(throwError(() => error));

      await expect(service.addToFolder(12345)).rejects.toThrow();

      expect(errorSpy).toHaveBeenCalledWith(
        'Error adding release to folder:',
        error,
      );
    });
  });
});
