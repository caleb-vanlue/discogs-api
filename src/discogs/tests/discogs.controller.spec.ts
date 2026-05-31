import { Test, TestingModule } from '@nestjs/testing';
import { DiscogsController } from '../discogs.controller';
import { DiscogsApiService } from '../discogs-api.service';
import { SuggestionService } from '../suggestion.service';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

describe('DiscogsController', () => {
  let controller: DiscogsController;

  const mockDiscogsApiService = {
    searchReleases: jest.fn(),
  };

  const mockSuggestionService = {
    getUserSuggestions: jest.fn(),
    addToSuggestions: jest.fn(),
    removeFromSuggestions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscogsController],
      providers: [
        {
          provide: DiscogsApiService,
          useValue: mockDiscogsApiService,
        },
        {
          provide: SuggestionService,
          useValue: mockSuggestionService,
        },
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .setLogger({
        log: () => {},
        error: () => {},
        warn: () => {},
        debug: () => {},
        verbose: () => {},
      })
      .compile();

    controller = module.get<DiscogsController>(DiscogsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('searchReleases', () => {
    const mockSearchResponse = {
      results: [
        {
          id: 12345,
          title: 'Test Album',
          year: 2023,
          thumb: 'https://example.com/thumb.jpg',
          cover_image: 'https://example.com/cover.jpg',
        },
      ],
      pagination: {
        page: 1,
        pages: 5,
        per_page: 50,
        items: 250,
      },
    };

    it('should search releases with required query parameter', async () => {
      mockDiscogsApiService.searchReleases.mockResolvedValue(mockSearchResponse);

      const searchDto = { query: 'Pink Floyd', page: 1, per_page: 50 };
      const result = await controller.searchReleases(searchDto);

      expect(result).toEqual(mockSearchResponse);
      expect(mockDiscogsApiService.searchReleases).toHaveBeenCalledWith(
        'Pink Floyd',
        1,
        50,
      );
    });

    it('should search releases with custom pagination', async () => {
      mockDiscogsApiService.searchReleases.mockResolvedValue(mockSearchResponse);

      const searchDto = { query: 'Beatles', page: 2, per_page: 25 };
      const result = await controller.searchReleases(searchDto);

      expect(result).toEqual(mockSearchResponse);
      expect(mockDiscogsApiService.searchReleases).toHaveBeenCalledWith(
        'Beatles',
        2,
        25,
      );
    });

    it('should return empty results when no matches found', async () => {
      const emptyResponse = {
        results: [],
        pagination: { page: 1, pages: 0, per_page: 50, items: 0 },
      };
      mockDiscogsApiService.searchReleases.mockResolvedValue(emptyResponse);

      const result = await controller.searchReleases({ query: 'NonexistentAlbum123' });

      expect(result).toEqual(emptyResponse);
    });

    it('should log search request', async () => {
      const logSpy = jest.spyOn(controller['logger'], 'log');
      mockDiscogsApiService.searchReleases.mockResolvedValue(mockSearchResponse);

      await controller.searchReleases({ query: 'Test Query' });

      expect(logSpy).toHaveBeenCalledWith(
        'Searching releases with query: Test Query',
      );
    });

    it('should handle service errors', async () => {
      const error = new Error('Search API error');
      mockDiscogsApiService.searchReleases.mockRejectedValue(error);

      await expect(
        controller.searchReleases({ query: 'Error Test' }),
      ).rejects.toThrow(error);
    });
  });

  describe('ApiKeyGuard', () => {
    it('should have ApiKeyGuard applied to controller', () => {
      const guards = Reflect.getMetadata('__guards__', DiscogsController);
      const guard = new guards[0]();

      expect(guard).toBeInstanceOf(ApiKeyGuard);
    });
  });
});
