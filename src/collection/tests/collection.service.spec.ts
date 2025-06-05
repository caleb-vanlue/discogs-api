import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CollectionService } from '../collection.service';
import { UserCollectionRepository } from '../repositories/user-collection.repository';
import { UserWantlistRepository } from '../repositories/user-wantlist.repository';
import { UserSuggestionRepository } from '../repositories/user-suggestion.repository';
import {
  DEFAULT_LIMIT,
  DEFAULT_OFFSET,
} from '../../common/constants/sort.constants';

describe('CollectionService', () => {
  let service: CollectionService;
  let collectionRepo: UserCollectionRepository;
  let wantlistRepo: UserWantlistRepository;
  let suggestionRepo: UserSuggestionRepository;

  const mockCollectionRepo = {
    findByUserIdSorted: jest.fn(),
    getCollectionStats: jest.fn(),
    findByUserAndRelease: jest.fn(),
    addToCollection: jest.fn(),
    removeFromCollection: jest.fn(),
    getAvailableSortOptions: jest.fn(),
  };

  const mockWantlistRepo = {
    findByUserIdSorted: jest.fn(),
    getWantlistStats: jest.fn(),
    findByUserAndRelease: jest.fn(),
    addToWantlist: jest.fn(),
    removeFromWantlist: jest.fn(),
    getAvailableSortOptions: jest.fn(),
  };

  const mockSuggestionRepo = {
    findByUserIdSorted: jest.fn(),
    getSuggestionsStats: jest.fn(),
    findByUserAndRelease: jest.fn(),
    addToSuggestions: jest.fn(),
    removeFromSuggestions: jest.fn(),
    updateSuggestionItem: jest.fn(),
  };


  const mockUserId = 'test-user-123';
  const mockReleaseId = 12345;

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
        {
          provide: UserSuggestionRepository,
          useValue: mockSuggestionRepo,
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
    collectionRepo = module.get<UserCollectionRepository>(
      UserCollectionRepository,
    );
    wantlistRepo = module.get<UserWantlistRepository>(UserWantlistRepository);
    suggestionRepo = module.get<UserSuggestionRepository>(
      UserSuggestionRepository,
    );

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
        hasMore: false, // offset (40) + items.length (2) >= total (10)
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
        { input: 'descending', expected: 'DESC' },
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

  describe('getUserStats', () => {
    it('should return combined user stats', async () => {
      const mockCollectionStats = {
        totalItems: 150,
        totalValue: 3000,
        genres: { rock: 50, jazz: 30 },
      };
      const mockWantlistStats = {
        totalItems: 25,
        genres: { electronic: 15, hip_hop: 10 },
      };
      const mockSuggestionStats = {
        totalItems: 10,
      };

      mockCollectionRepo.getCollectionStats.mockResolvedValue(
        mockCollectionStats,
      );
      mockWantlistRepo.getWantlistStats.mockResolvedValue(mockWantlistStats);
      mockSuggestionRepo.getSuggestionsStats.mockResolvedValue(
        mockSuggestionStats,
      );

      const result = await service.getUserStats(mockUserId);

      expect(result).toEqual({
        collection: mockCollectionStats,
        wantlist: mockWantlistStats,
        suggestions: mockSuggestionStats,
        summary: {
          totalItems: 185,
          collectionItems: 150,
          wantlistItems: 25,
          suggestionItems: 10,
        },
      });

      expect(mockCollectionRepo.getCollectionStats).toHaveBeenCalledWith(
        mockUserId,
      );
      expect(mockWantlistRepo.getWantlistStats).toHaveBeenCalledWith(
        mockUserId,
      );
      expect(mockSuggestionRepo.getSuggestionsStats).toHaveBeenCalledWith(
        mockUserId,
      );
    });

    it('should handle repository errors', async () => {
      const error = new Error('Stats error');
      mockCollectionRepo.getCollectionStats.mockRejectedValue(error);
      mockWantlistRepo.getWantlistStats.mockResolvedValue({});

      await expect(service.getUserStats(mockUserId)).rejects.toThrow(error);
    });
  });

  describe('addToCollection', () => {
    const addData = {
      releaseId: mockReleaseId,
      rating: 5,
      notes: 'Great album!',
    };

    it('should add release to collection successfully', async () => {
      const mockResponse = { id: 1, ...addData };
      mockCollectionRepo.findByUserAndRelease.mockResolvedValue(null);
      mockCollectionRepo.addToCollection.mockResolvedValue(mockResponse);

      const result = await service.addToCollection(mockUserId, addData);

      expect(result).toEqual(mockResponse);
      expect(mockCollectionRepo.findByUserAndRelease).toHaveBeenCalledWith(
        mockUserId,
        mockReleaseId,
      );
      expect(mockCollectionRepo.addToCollection).toHaveBeenCalledWith({
        userId: mockUserId,
        releaseId: mockReleaseId,
        rating: 5,
        notes: 'Great album!',
        dateAdded: expect.any(Date),
      });
    });

    it('should use default rating of 0 if not provided', async () => {
      const dataWithoutRating = { releaseId: mockReleaseId };
      mockCollectionRepo.findByUserAndRelease.mockResolvedValue(null);
      mockCollectionRepo.addToCollection.mockResolvedValue({});

      await service.addToCollection(mockUserId, dataWithoutRating);

      expect(mockCollectionRepo.addToCollection).toHaveBeenCalledWith(
        expect.objectContaining({
          rating: 0,
        }),
      );
    });

    it('should throw ConflictException if release already in collection', async () => {
      mockCollectionRepo.findByUserAndRelease.mockResolvedValue({
        id: 1,
        releaseId: mockReleaseId,
      });

      await expect(
        service.addToCollection(mockUserId, addData),
      ).rejects.toThrow(ConflictException);

      expect(mockCollectionRepo.addToCollection).not.toHaveBeenCalled();
    });

    it('should log error and rethrow on repository failure', async () => {
      const error = new Error('Database error');
      const logSpy = jest.spyOn(service['logger'], 'error');
      mockCollectionRepo.findByUserAndRelease.mockResolvedValue(null);
      mockCollectionRepo.addToCollection.mockRejectedValue(error);

      await expect(
        service.addToCollection(mockUserId, addData),
      ).rejects.toThrow(error);

      expect(logSpy).toHaveBeenCalledWith(
        `Failed to add release ${mockReleaseId} to collection for user ${mockUserId}`,
        error,
      );
    });
  });

  describe('addToWantlist', () => {
    const addData = {
      releaseId: mockReleaseId,
      notes: 'Must have!',
    };

    it('should add release to wantlist successfully', async () => {
      const mockResponse = { id: 1, ...addData };
      mockWantlistRepo.findByUserAndRelease.mockResolvedValue(null);
      mockWantlistRepo.addToWantlist.mockResolvedValue(mockResponse);

      const result = await service.addToWantlist(mockUserId, addData);

      expect(result).toEqual(mockResponse);
      expect(mockWantlistRepo.findByUserAndRelease).toHaveBeenCalledWith(
        mockUserId,
        mockReleaseId,
      );
      expect(mockWantlistRepo.addToWantlist).toHaveBeenCalledWith({
        userId: mockUserId,
        releaseId: mockReleaseId,
        notes: 'Must have!',
        dateAdded: expect.any(Date),
      });
    });

    it('should throw ConflictException if release already in wantlist', async () => {
      mockWantlistRepo.findByUserAndRelease.mockResolvedValue({
        id: 1,
        releaseId: mockReleaseId,
      });

      await expect(service.addToWantlist(mockUserId, addData)).rejects.toThrow(
        ConflictException,
      );

      expect(mockWantlistRepo.addToWantlist).not.toHaveBeenCalled();
    });

    it('should log error and rethrow on repository failure', async () => {
      const error = new Error('Database error');
      const logSpy = jest.spyOn(service['logger'], 'error');
      mockWantlistRepo.findByUserAndRelease.mockResolvedValue(null);
      mockWantlistRepo.addToWantlist.mockRejectedValue(error);

      await expect(service.addToWantlist(mockUserId, addData)).rejects.toThrow(
        error,
      );

      expect(logSpy).toHaveBeenCalledWith(
        `Failed to add release ${mockReleaseId} to wantlist for user ${mockUserId}`,
        error,
      );
    });
  });

  describe('removeFromCollection', () => {
    it('should remove release from collection successfully', async () => {
      mockCollectionRepo.findByUserAndRelease.mockResolvedValue({
        id: 1,
        releaseId: mockReleaseId,
      });
      mockCollectionRepo.removeFromCollection.mockResolvedValue(undefined);

      const result = await service.removeFromCollection(
        mockUserId,
        mockReleaseId,
      );

      expect(result).toEqual({
        message: 'Release removed from collection',
        releaseId: mockReleaseId,
      });
      expect(mockCollectionRepo.findByUserAndRelease).toHaveBeenCalledWith(
        mockUserId,
        mockReleaseId,
      );
      expect(mockCollectionRepo.removeFromCollection).toHaveBeenCalledWith(
        mockUserId,
        mockReleaseId,
      );
    });

    it('should throw NotFoundException if release not in collection', async () => {
      mockCollectionRepo.findByUserAndRelease.mockResolvedValue(null);

      await expect(
        service.removeFromCollection(mockUserId, mockReleaseId),
      ).rejects.toThrow(NotFoundException);

      expect(mockCollectionRepo.removeFromCollection).not.toHaveBeenCalled();
    });

    it('should log error and rethrow on repository failure', async () => {
      const error = new Error('Database error');
      const logSpy = jest.spyOn(service['logger'], 'error');
      mockCollectionRepo.findByUserAndRelease.mockResolvedValue({
        id: 1,
      });
      mockCollectionRepo.removeFromCollection.mockRejectedValue(error);

      await expect(
        service.removeFromCollection(mockUserId, mockReleaseId),
      ).rejects.toThrow(error);

      expect(logSpy).toHaveBeenCalledWith(
        `Failed to remove release ${mockReleaseId} from collection for user ${mockUserId}`,
        error,
      );
    });
  });

  describe('removeFromWantlist', () => {
    it('should remove release from wantlist successfully', async () => {
      mockWantlistRepo.findByUserAndRelease.mockResolvedValue({
        id: 1,
        releaseId: mockReleaseId,
      });
      mockWantlistRepo.removeFromWantlist.mockResolvedValue(undefined);

      const result = await service.removeFromWantlist(
        mockUserId,
        mockReleaseId,
      );

      expect(result).toEqual({
        message: 'Release removed from wantlist',
        releaseId: mockReleaseId,
      });
      expect(mockWantlistRepo.findByUserAndRelease).toHaveBeenCalledWith(
        mockUserId,
        mockReleaseId,
      );
      expect(mockWantlistRepo.removeFromWantlist).toHaveBeenCalledWith(
        mockUserId,
        mockReleaseId,
      );
    });

    it('should throw NotFoundException if release not in wantlist', async () => {
      mockWantlistRepo.findByUserAndRelease.mockResolvedValue(null);

      await expect(
        service.removeFromWantlist(mockUserId, mockReleaseId),
      ).rejects.toThrow(NotFoundException);

      expect(mockWantlistRepo.removeFromWantlist).not.toHaveBeenCalled();
    });

    it('should log error and rethrow on repository failure', async () => {
      const error = new Error('Database error');
      const logSpy = jest.spyOn(service['logger'], 'error');
      mockWantlistRepo.findByUserAndRelease.mockResolvedValue({ id: 1 });
      mockWantlistRepo.removeFromWantlist.mockRejectedValue(error);

      await expect(
        service.removeFromWantlist(mockUserId, mockReleaseId),
      ).rejects.toThrow(error);

      expect(logSpy).toHaveBeenCalledWith(
        `Failed to remove release ${mockReleaseId} from wantlist for user ${mockUserId}`,
        error,
      );
    });
  });

  describe('getCollectionSortOptions', () => {
    it('should return collection sort options from repository', () => {
      const mockOptions = ['dateAdded', 'title', 'artist', 'year'];
      mockCollectionRepo.getAvailableSortOptions.mockReturnValue(mockOptions);

      const result = service.getCollectionSortOptions();

      expect(result).toEqual(mockOptions);
      expect(mockCollectionRepo.getAvailableSortOptions).toHaveBeenCalled();
    });
  });

  describe('getWantlistSortOptions', () => {
    it('should return wantlist sort options from repository', () => {
      const mockOptions = ['dateAdded', 'title', 'artist'];
      mockWantlistRepo.getAvailableSortOptions.mockReturnValue(mockOptions);

      const result = service.getWantlistSortOptions();

      expect(result).toEqual(mockOptions);
      expect(mockWantlistRepo.getAvailableSortOptions).toHaveBeenCalled();
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
