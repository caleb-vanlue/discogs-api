import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ReleaseService } from '../release.service';
import { ReleaseRepository } from '../release.repository';

describe('ReleaseService', () => {
  let service: ReleaseService;
  let releaseRepository: ReleaseRepository;

  const mockReleaseRepository = {
    findAllSorted: jest.fn(),
    findByDiscogsId: jest.fn(),
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

  const mockReleases = [mockRelease];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReleaseService,
        {
          provide: ReleaseRepository,
          useValue: mockReleaseRepository,
        },
      ],
    }).compile();

    service = module.get<ReleaseService>(ReleaseService);
    releaseRepository = module.get<ReleaseRepository>(ReleaseRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getReleases', () => {
    beforeEach(() => {
      mockReleaseRepository.findAllSorted.mockResolvedValue([mockReleases, 1]);
    });

    it('should get releases with default parameters', async () => {
      const result = await service.getReleases();

      expect(result).toEqual({
        data: mockReleases,
        total: 1,
        limit: 50, // DEFAULT_LIMIT
        offset: 0, // DEFAULT_OFFSET
        hasMore: false,
        sortBy: 'createdAt',
        sortOrder: 'DESC', // DEFAULT_SORT_ORDER
      });

      expect(mockReleaseRepository.findAllSorted).toHaveBeenCalledWith(
        50, // DEFAULT_LIMIT
        0, // DEFAULT_OFFSET
        'createdAt',
        'DESC',
      );
    });

    it('should get releases with custom parameters', async () => {
      const result = await service.getReleases(25, 10, 'title', 'asc');

      expect(result).toEqual({
        data: mockReleases,
        total: 1,
        limit: 25,
        offset: 10,
        hasMore: false,
        sortBy: 'title',
        sortOrder: 'ASC',
      });

      expect(mockReleaseRepository.findAllSorted).toHaveBeenCalledWith(
        25,
        10,
        'title',
        'ASC',
      );
    });

    it('should handle ascending sort order variations', async () => {
      const ascendingVariations = ['asc', 'ASC', 'ascending', 'ASCENDING'];

      for (const sortOrder of ascendingVariations) {
        await service.getReleases(50, 0, 'title', sortOrder);

        expect(mockReleaseRepository.findAllSorted).toHaveBeenCalledWith(
          50,
          0,
          'title',
          'ASC',
        );
      }
    });

    it('should default to DESC for unrecognized sort orders', async () => {
      const invalidSortOrders = [
        'desc',
        'descending',
        'invalid',
        '',
        undefined,
      ];

      for (const sortOrder of invalidSortOrders) {
        await service.getReleases(50, 0, 'title', sortOrder);

        expect(mockReleaseRepository.findAllSorted).toHaveBeenCalledWith(
          50,
          0,
          'title',
          'DESC',
        );
      }
    });

    it('should calculate hasMore correctly when there are more items', async () => {
      mockReleaseRepository.findAllSorted.mockResolvedValue([
        mockReleases,
        100,
      ]);

      const result = await service.getReleases(10, 0);

      expect(result.hasMore).toBe(true); // 0 + 1 < 100
      expect(result.total).toBe(100);
    });

    it('should calculate hasMore correctly when at the end', async () => {
      // If we return 1 item but total is 1, then we're at the end
      mockReleaseRepository.findAllSorted.mockResolvedValue([mockReleases, 1]);

      const result = await service.getReleases(50, 0);

      expect(result.hasMore).toBe(false); // 0 + 1 < 1 is false
      expect(result.total).toBe(1);
    });

    it('should calculate hasMore correctly with offset', async () => {
      // If we're at offset 99 with 1 item returned out of 100 total, we're at the end
      mockReleaseRepository.findAllSorted.mockResolvedValue([
        mockReleases,
        100,
      ]);

      const result = await service.getReleases(10, 99);

      expect(result.hasMore).toBe(false); // 99 + 1 < 100 is false
      expect(result.total).toBe(100);
    });

    it('should handle empty results', async () => {
      mockReleaseRepository.findAllSorted.mockResolvedValue([[], 0]);

      const result = await service.getReleases();

      expect(result).toEqual({
        data: [],
        total: 0,
        limit: 50,
        offset: 0,
        hasMore: false,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      });
    });

    it('should handle all valid sort fields', async () => {
      const sortFields = [
        'title',
        'primaryArtist',
        'year',
        'primaryGenre',
        'createdAt',
      ];

      for (const sortBy of sortFields) {
        await service.getReleases(50, 0, sortBy as any);

        expect(mockReleaseRepository.findAllSorted).toHaveBeenCalledWith(
          50,
          0,
          sortBy,
          'DESC',
        );
      }
    });

    it('should handle undefined sort field', async () => {
      const result = await service.getReleases(50, 0, undefined);

      expect(result.sortBy).toBe('createdAt');
      expect(mockReleaseRepository.findAllSorted).toHaveBeenCalledWith(
        50,
        0,
        'createdAt',
        'DESC',
      );
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database connection failed');
      mockReleaseRepository.findAllSorted.mockRejectedValue(error);

      await expect(service.getReleases()).rejects.toThrow(error);
    });

    it('should handle large datasets correctly', async () => {
      const largeDataset = Array(1000).fill(mockRelease);
      mockReleaseRepository.findAllSorted.mockResolvedValue([
        largeDataset,
        10000,
      ]);

      const result = await service.getReleases(1000, 5000);

      expect(result.hasMore).toBe(true); // 5000 + 1000 < 10000
      expect(result.data.length).toBe(1000);
      expect(result.total).toBe(10000);
    });
  });

  describe('getReleaseByDiscogsId', () => {
    const discogsId = 12345;

    it('should return release when found', async () => {
      mockReleaseRepository.findByDiscogsId.mockResolvedValue(mockRelease);

      const result = await service.getReleaseByDiscogsId(discogsId);

      expect(result).toEqual(mockRelease);
      expect(mockReleaseRepository.findByDiscogsId).toHaveBeenCalledWith(
        discogsId,
      );
    });

    it('should throw NotFoundException when release not found', async () => {
      mockReleaseRepository.findByDiscogsId.mockResolvedValue(null);

      await expect(service.getReleaseByDiscogsId(discogsId)).rejects.toThrow(
        new NotFoundException(`Release with Discogs ID ${discogsId} not found`),
      );

      expect(mockReleaseRepository.findByDiscogsId).toHaveBeenCalledWith(
        discogsId,
      );
    });

    it('should handle different Discogs IDs', async () => {
      const testIds = [1, 12345, 999999, 123456789];

      for (const id of testIds) {
        mockReleaseRepository.findByDiscogsId.mockResolvedValue(mockRelease);

        const result = await service.getReleaseByDiscogsId(id);

        expect(result).toEqual(mockRelease);
        expect(mockReleaseRepository.findByDiscogsId).toHaveBeenCalledWith(id);
      }
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database error');
      mockReleaseRepository.findByDiscogsId.mockRejectedValue(error);

      await expect(service.getReleaseByDiscogsId(discogsId)).rejects.toThrow(
        error,
      );
    });

    it('should handle zero and negative IDs', async () => {
      const invalidIds = [0, -1, -12345];

      for (const id of invalidIds) {
        mockReleaseRepository.findByDiscogsId.mockResolvedValue(null);

        await expect(service.getReleaseByDiscogsId(id)).rejects.toThrow(
          NotFoundException,
        );
      }
    });
  });

  describe('mapSortOrder (private method)', () => {
    it('should map ascending variations correctly', () => {
      // Test through public method since mapSortOrder is private
      const ascendingInputs = [
        'asc',
        'ASC',
        'ascending',
        'ASCENDING',
        'Asc',
        'Ascending',
      ];

      for (const input of ascendingInputs) {
        mockReleaseRepository.findAllSorted.mockClear();
        service.getReleases(50, 0, 'title', input);

        expect(mockReleaseRepository.findAllSorted).toHaveBeenCalledWith(
          50,
          0,
          'title',
          'ASC',
        );
      }
    });

    it('should default to DESC for all other inputs', () => {
      const nonAscendingInputs = [
        'desc',
        'DESC',
        'descending',
        'DESCENDING',
        'invalid',
        'random',
        '',
        '   ',
        undefined,
      ];

      for (const input of nonAscendingInputs) {
        mockReleaseRepository.findAllSorted.mockClear();
        service.getReleases(50, 0, 'title', input);

        expect(mockReleaseRepository.findAllSorted).toHaveBeenCalledWith(
          50,
          0,
          'title',
          'DESC',
        );
      }
    });

    it('should handle whitespace in sort order', () => {
      // The service uses toLowerCase() but doesn't trim whitespace
      // So inputs with leading/trailing spaces won't match 'asc' or 'ascending'
      const whitespaceInputs = [' asc ', '  ascending  ', '\tasc\n'];

      for (const input of whitespaceInputs) {
        mockReleaseRepository.findAllSorted.mockClear();
        service.getReleases(50, 0, 'title', input);

        // These should map to DESC since they don't match exactly after toLowerCase
        expect(mockReleaseRepository.findAllSorted).toHaveBeenCalledWith(
          50,
          0,
          'title',
          'DESC',
        );
      }
    });
  });

  describe('edge cases', () => {
    it('should handle null parameters gracefully', async () => {
      mockReleaseRepository.findAllSorted.mockResolvedValue([mockReleases, 1]);

      const result = await service.getReleases(
        null as any,
        null as any,
        null as any,
        null as any,
      );

      expect(result.limit).toBe(50); // Should use default
      expect(result.offset).toBe(0); // Should use default
      expect(result.sortBy).toBe('createdAt'); // Should use default
      expect(result.sortOrder).toBe('DESC'); // Should use default
    });

    it('should handle very large numbers', async () => {
      mockReleaseRepository.findAllSorted.mockResolvedValue([[], 0]);

      await service.getReleases(
        Number.MAX_SAFE_INTEGER,
        Number.MAX_SAFE_INTEGER,
      );

      expect(mockReleaseRepository.findAllSorted).toHaveBeenCalledWith(
        Number.MAX_SAFE_INTEGER,
        Number.MAX_SAFE_INTEGER,
        'createdAt',
        'DESC',
      );
    });

    it('should handle hasMore calculation with exact boundary', async () => {
      // If we get exactly the number of items we requested, but there could be more
      const fiftyReleases = Array(50).fill(mockRelease);
      mockReleaseRepository.findAllSorted.mockResolvedValue([
        fiftyReleases,
        51,
      ]);

      const result = await service.getReleases(50, 0); // Will get 50 items, total is 51

      expect(result.hasMore).toBe(true); // 0 + 50 < 51 is true
    });
  });
});
