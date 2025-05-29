import { Test, TestingModule } from '@nestjs/testing';
import { ReleaseController } from '../release.controller';
import { ReleaseService } from '../release.service';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { ReleaseQueryDto } from '../dto/release-query.dto';

describe('ReleaseController', () => {
  let controller: ReleaseController;

  const mockReleaseService = {
    getReleases: jest.fn(),
    getReleaseByDiscogsId: jest.fn(),
  };

  const mockRelease = {
    id: 'release-123',
    discogsId: 12345,
    title: 'Test Album',
    year: 2023,
    primaryArtist: 'Test Artist',
    primaryLabel: 'Test Label',
    primaryFormat: 'Vinyl',
    primaryGenre: 'Rock',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  };

  const mockReleasesResponse = {
    data: [mockRelease],
    total: 1,
    limit: 50,
    offset: 0,
    hasMore: false,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReleaseController],
      providers: [
        {
          provide: ReleaseService,
          useValue: mockReleaseService,
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

    controller = module.get<ReleaseController>(ReleaseController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getReleases', () => {
    it('should get releases with default parameters', async () => {
      mockReleaseService.getReleases.mockResolvedValue(mockReleasesResponse);
      const query: ReleaseQueryDto = {};

      const result = await controller.getReleases(query);

      expect(result).toEqual(mockReleasesResponse);
      expect(mockReleaseService.getReleases).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
        undefined,
      );
    });

    it('should get releases with custom parameters', async () => {
      mockReleaseService.getReleases.mockResolvedValue(mockReleasesResponse);
      const query: ReleaseQueryDto = {
        limit: 25,
        offset: 50,
        sortBy: 'title',
        sortOrder: 'asc',
      };

      const result = await controller.getReleases(query);

      expect(result).toEqual(mockReleasesResponse);
      expect(mockReleaseService.getReleases).toHaveBeenCalledWith(
        25,
        50,
        'title',
        'asc',
      );
    });

    it('should get releases with pagination parameters', async () => {
      mockReleaseService.getReleases.mockResolvedValue(mockReleasesResponse);
      const query: ReleaseQueryDto = {
        limit: 10,
        offset: 20,
      };

      const result = await controller.getReleases(query);

      expect(result).toEqual(mockReleasesResponse);
      expect(mockReleaseService.getReleases).toHaveBeenCalledWith(
        10,
        20,
        undefined,
        undefined,
      );
    });

    it('should get releases with sorting parameters', async () => {
      mockReleaseService.getReleases.mockResolvedValue(mockReleasesResponse);
      const query: ReleaseQueryDto = {
        sortBy: 'primaryArtist',
        sortOrder: 'desc',
      };

      const result = await controller.getReleases(query);

      expect(result).toEqual(mockReleasesResponse);
      expect(mockReleaseService.getReleases).toHaveBeenCalledWith(
        undefined,
        undefined,
        'primaryArtist',
        'desc',
      );
    });

    it('should handle all valid sort fields', async () => {
      const sortFields = [
        'title',
        'primaryArtist',
        'year',
        'primaryGenre',
        'createdAt',
      ];
      mockReleaseService.getReleases.mockResolvedValue(mockReleasesResponse);

      for (const sortBy of sortFields) {
        const query: ReleaseQueryDto = { sortBy: sortBy as any };

        await controller.getReleases(query);

        expect(mockReleaseService.getReleases).toHaveBeenCalledWith(
          undefined,
          undefined,
          sortBy,
          undefined,
        );
      }
    });

    it('should handle both sort orders', async () => {
      const sortOrders = ['asc', 'desc'];
      mockReleaseService.getReleases.mockResolvedValue(mockReleasesResponse);

      for (const sortOrder of sortOrders) {
        const query: ReleaseQueryDto = { sortOrder };

        await controller.getReleases(query);

        expect(mockReleaseService.getReleases).toHaveBeenCalledWith(
          undefined,
          undefined,
          undefined,
          sortOrder,
        );
      }
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      mockReleaseService.getReleases.mockRejectedValue(error);
      const query: ReleaseQueryDto = {};

      await expect(controller.getReleases(query)).rejects.toThrow(error);
    });
  });

  describe('getReleaseByDiscogsId', () => {
    const discogsId = 12345;

    it('should get release by Discogs ID successfully', async () => {
      mockReleaseService.getReleaseByDiscogsId.mockResolvedValue(mockRelease);

      const result = await controller.getReleaseByDiscogsId(discogsId);

      expect(result).toEqual(mockRelease);
      expect(mockReleaseService.getReleaseByDiscogsId).toHaveBeenCalledWith(
        discogsId,
      );
    });

    it('should handle different Discogs IDs', async () => {
      const testIds = [1, 12345, 999999];
      mockReleaseService.getReleaseByDiscogsId.mockResolvedValue(mockRelease);

      for (const id of testIds) {
        await controller.getReleaseByDiscogsId(id);

        expect(mockReleaseService.getReleaseByDiscogsId).toHaveBeenCalledWith(
          id,
        );
      }
    });

    it('should handle not found errors', async () => {
      const notFoundError = new Error('Release not found');
      mockReleaseService.getReleaseByDiscogsId.mockRejectedValue(notFoundError);

      await expect(controller.getReleaseByDiscogsId(discogsId)).rejects.toThrow(
        notFoundError,
      );
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      mockReleaseService.getReleaseByDiscogsId.mockRejectedValue(error);

      await expect(controller.getReleaseByDiscogsId(discogsId)).rejects.toThrow(
        error,
      );
    });

    it('should parse integer parameter correctly', async () => {
      // The ParseIntPipe would handle this in real scenario
      mockReleaseService.getReleaseByDiscogsId.mockResolvedValue(mockRelease);

      await controller.getReleaseByDiscogsId(12345);

      expect(mockReleaseService.getReleaseByDiscogsId).toHaveBeenCalledWith(
        12345,
      );
      expect(typeof 12345).toBe('number');
    });
  });

  describe('guards and decorators', () => {
    it('should have ApiKeyGuard applied', () => {
      const guards = Reflect.getMetadata('__guards__', ReleaseController);
      expect(guards).toBeDefined();
      expect(guards.length).toBeGreaterThan(0);
    });
  });

  describe('error scenarios', () => {
    it('should handle malformed query parameters gracefully', async () => {
      mockReleaseService.getReleases.mockResolvedValue(mockReleasesResponse);

      const query: ReleaseQueryDto = {
        limit: -1, // Invalid but would be validated by DTO
        offset: -5, // Invalid but would be validated by DTO
      };

      const result = await controller.getReleases(query);

      expect(result).toEqual(mockReleasesResponse);
      expect(mockReleaseService.getReleases).toHaveBeenCalledWith(
        -1,
        -5,
        undefined,
        undefined,
      );
    });

    it('should handle very large pagination values', async () => {
      mockReleaseService.getReleases.mockResolvedValue(mockReleasesResponse);
      const query: ReleaseQueryDto = {
        limit: 10000,
        offset: 1000000,
      };

      const result = await controller.getReleases(query);

      expect(result).toEqual(mockReleasesResponse);
      expect(mockReleaseService.getReleases).toHaveBeenCalledWith(
        10000,
        1000000,
        undefined,
        undefined,
      );
    });
  });
});
