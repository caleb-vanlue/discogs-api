import { Test, TestingModule } from '@nestjs/testing';
import { CollectionService } from '../collection.service';
import { UserCollectionRepository } from '../repositories/user-collection.repository';
import { UserWantlistRepository } from '../repositories/user-wantlist.repository';
import {
  DEFAULT_LIMIT,
  DEFAULT_OFFSET,
} from '../../common/constants/sort.constants';

describe('CollectionService', () => {
  let service: CollectionService;

  const mockCollectionRepo = {
    findByUserIdSorted: jest.fn(),
  };

  const mockWantlistRepo = {
    findByUserIdSorted: jest.fn(),
  };

  const mockUserId = 'test-user-123';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollectionService,
        {
          provide: UserCollectionRepository,
          useValue: mockCollectionRepo,
        },
        {
          provide: UserWantlistRepository,
          useValue: mockWantlistRepo,
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

    service = module.get<CollectionService>(CollectionService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserCollection', () => {
    const mockItems = [
      { id: 1, title: 'Test Album 1' },
      { id: 2, title: 'Test Album 2' },
    ];
    const mockTotal = 10;

    it('should return user collection with default parameters', async () => {
      mockCollectionRepo.findByUserIdSorted.mockResolvedValue([
        mockItems,
        mockTotal,
      ]);

      const result = await service.getUserCollection(mockUserId);

      expect(result).toEqual({
        data: mockItems,
        total: mockTotal,
        limit: DEFAULT_LIMIT,
        offset: DEFAULT_OFFSET,
        hasMore: true,
        sortBy: 'dateAdded',
        sortOrder: 'DESC',
      });

      expect(mockCollectionRepo.findByUserIdSorted).toHaveBeenCalledWith(
        mockUserId,
        DEFAULT_LIMIT,
        DEFAULT_OFFSET,
        'dateAdded',
        'DESC',
      );
    });

    it('should return user collection with custom parameters', async () => {
      const limit = 20;
      const offset = 40;
      const sortBy = 'primaryArtist';
      const sortOrder = 'asc';

      mockCollectionRepo.findByUserIdSorted.mockResolvedValue([
        mockItems,
        mockTotal,
      ]);

      const result = await service.getUserCollection(
        mockUserId,
        limit,
        offset,
        sortBy,
        sortOrder,
      );

      expect(result).toEqual({
        data: mockItems,
        total: mockTotal,
        limit,
        offset,
        hasMore: false,
        sortBy: 'primaryArtist',
        sortOrder: 'ASC',
      });

      expect(mockCollectionRepo.findByUserIdSorted).toHaveBeenCalledWith(
        mockUserId,
        limit,
        offset,
        'primaryArtist',
        'ASC',
      );
    });

    it('should map sort field aliases correctly', async () => {
      const sortFieldMappings = [
        { input: 'artist', expected: 'primaryArtist' },
        { input: 'added', expected: 'dateAdded' },
        { input: 'date_added', expected: 'dateAdded' },
        { input: 'genre', expected: 'primaryGenre' },
        { input: 'format', expected: 'primaryFormat' },
      ];

      for (const mapping of sortFieldMappings) {
        mockCollectionRepo.findByUserIdSorted.mockResolvedValue([[], 0]);

        await service.getUserCollection(
          mockUserId,
          undefined,
          undefined,
          mapping.input,
        );

        expect(mockCollectionRepo.findByUserIdSorted).toHaveBeenCalledWith(
          mockUserId,
          DEFAULT_LIMIT,
          DEFAULT_OFFSET,
          mapping.expected,
          'DESC',
        );
      }
    });

    it('should map sort order correctly', async () => {
      const sortOrderMappings = [
        { input: 'asc', expected: 'ASC' },
        { input: 'ASC', expected: 'ASC' },
        { input: 'ascending', expected: 'ASC' },
        { input: 'desc', expected: 'DESC' },
        { input: 'DESC', expected: 'DESC' },
        { input: undefined, expected: 'DESC' },
      ];

      for (const mapping of sortOrderMappings) {
        mockCollectionRepo.findByUserIdSorted.mockResolvedValue([[], 0]);

        await service.getUserCollection(
          mockUserId,
          undefined,
          undefined,
          undefined,
          mapping.input,
        );

        expect(mockCollectionRepo.findByUserIdSorted).toHaveBeenCalledWith(
          mockUserId,
          DEFAULT_LIMIT,
          DEFAULT_OFFSET,
          'dateAdded',
          mapping.expected,
        );
      }
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database error');
      mockCollectionRepo.findByUserIdSorted.mockRejectedValue(error);

      await expect(service.getUserCollection(mockUserId)).rejects.toThrow(
        error,
      );
    });
  });

  describe('getUserWantlist', () => {
    const mockItems = [{ id: 3, title: 'Wanted Album' }];
    const mockTotal = 5;

    it('should return user wantlist with default parameters', async () => {
      mockWantlistRepo.findByUserIdSorted.mockResolvedValue([
        mockItems,
        mockTotal,
      ]);

      const result = await service.getUserWantlist(mockUserId);

      expect(result).toEqual({
        data: mockItems,
        total: mockTotal,
        limit: DEFAULT_LIMIT,
        offset: DEFAULT_OFFSET,
        hasMore: true,
        sortBy: 'dateAdded',
        sortOrder: 'DESC',
      });

      expect(mockWantlistRepo.findByUserIdSorted).toHaveBeenCalledWith(
        mockUserId,
        DEFAULT_LIMIT,
        DEFAULT_OFFSET,
        'dateAdded',
        'DESC',
      );
    });

    it('should return user wantlist with custom parameters', async () => {
      const limit = 10;
      const offset = 0;
      const sortBy = 'title';
      const sortOrder = 'asc';

      mockWantlistRepo.findByUserIdSorted.mockResolvedValue([
        mockItems,
        mockTotal,
      ]);

      const result = await service.getUserWantlist(
        mockUserId,
        limit,
        offset,
        sortBy,
        sortOrder,
      );

      expect(result).toEqual({
        data: mockItems,
        total: mockTotal,
        limit,
        offset,
        hasMore: true,
        sortBy: 'title',
        sortOrder: 'ASC',
      });

      expect(mockWantlistRepo.findByUserIdSorted).toHaveBeenCalledWith(
        mockUserId,
        limit,
        offset,
        'title',
        'ASC',
      );
    });
  });

  describe('Logger', () => {
    it('should log when getting user collection', async () => {
      const logSpy = jest.spyOn(service['logger'], 'log');
      mockCollectionRepo.findByUserIdSorted.mockResolvedValue([[], 0]);

      await service.getUserCollection(
        mockUserId,
        undefined,
        undefined,
        'artist',
        'asc',
      );

      expect(logSpy).toHaveBeenCalledWith(
        `Getting collection for user ${mockUserId} - sort: primaryArtist ASC`,
      );
    });

    it('should log when getting user wantlist', async () => {
      const logSpy = jest.spyOn(service['logger'], 'log');
      mockWantlistRepo.findByUserIdSorted.mockResolvedValue([[], 0]);

      await service.getUserWantlist(
        mockUserId,
        undefined,
        undefined,
        'title',
        'desc',
      );

      expect(logSpy).toHaveBeenCalledWith(
        `Getting wantlist for user ${mockUserId} - sort: title DESC`,
      );
    });
  });
});
