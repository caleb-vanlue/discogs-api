import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { SuggestionService } from '../suggestion.service';
import { DiscogsApiService } from '../discogs-api.service';
import { DiscogsSyncService } from '../discogs-sync.service';
import { UserSuggestionRepository } from '../../collection/repositories/user-suggestion.repository';
import { ReleaseRepository } from '../../release/release.repository';

describe('SuggestionService', () => {
  let service: SuggestionService;
  let discogsApiService: DiscogsApiService;
  let discogsSyncService: DiscogsSyncService;
  let suggestionRepo: UserSuggestionRepository;
  let releaseRepo: ReleaseRepository;

  const mockDiscogsApiService = {
    addToFolder: jest.fn(),
  };

  const mockDiscogsSyncService = {
    syncUserSuggestions: jest.fn(),
  };

  const mockSuggestionRepo = {
    findByUserAndRelease: jest.fn(),
    removeFromSuggestions: jest.fn(),
    findByUserIdSorted: jest.fn(),
    getSuggestionsStats: jest.fn(),
  };

  const mockReleaseRepo = {
    findByDiscogsId: jest.fn(),
  };

  const mockUserId = 'test-user-123';
  const mockReleaseId = 12345;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuggestionService,
        {
          provide: DiscogsApiService,
          useValue: mockDiscogsApiService,
        },
        {
          provide: DiscogsSyncService,
          useValue: mockDiscogsSyncService,
        },
        {
          provide: UserSuggestionRepository,
          useValue: mockSuggestionRepo,
        },
        {
          provide: ReleaseRepository,
          useValue: mockReleaseRepo,
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

    service = module.get<SuggestionService>(SuggestionService);
    discogsApiService = module.get<DiscogsApiService>(DiscogsApiService);
    discogsSyncService = module.get<DiscogsSyncService>(DiscogsSyncService);
    suggestionRepo = module.get<UserSuggestionRepository>(UserSuggestionRepository);
    releaseRepo = module.get<ReleaseRepository>(ReleaseRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addToSuggestions', () => {
    const addData = {
      releaseId: mockReleaseId,
      notes: 'Recommended by friend',
    };

    it('should add release to Discogs, sync suggestions, and return result', async () => {
      const mockRelease = { id: 999, discogsId: mockReleaseId, title: 'Test Album' };
      const mockSyncedSuggestion = { id: 1, releaseId: mockRelease.id, notes: addData.notes };
      const mockSyncResult = { synced: 1, errors: 0, total: 1 };
      
      mockReleaseRepo.findByDiscogsId
        .mockResolvedValueOnce(null) // First check - release doesn't exist locally yet
        .mockResolvedValueOnce(mockRelease); // After sync - release exists
      mockSuggestionRepo.findByUserAndRelease.mockResolvedValue(mockSyncedSuggestion);
      mockDiscogsApiService.addToFolder.mockResolvedValue({ instance_id: 123 });
      mockDiscogsSyncService.syncUserSuggestions.mockResolvedValue(mockSyncResult);

      const result = await service.addToSuggestions(mockUserId, addData);

      expect(result).toEqual(mockSyncedSuggestion);
      expect(mockReleaseRepo.findByDiscogsId).toHaveBeenCalledTimes(2);
      expect(mockSuggestionRepo.findByUserAndRelease).toHaveBeenCalledWith(mockUserId, mockRelease.id);
      expect(mockDiscogsApiService.addToFolder).toHaveBeenCalledWith(mockReleaseId);
      expect(mockDiscogsSyncService.syncUserSuggestions).toHaveBeenCalledWith(mockUserId);
    });

    it('should throw ConflictException if release already in suggestions', async () => {
      const mockRelease = { id: 999, discogsId: mockReleaseId, title: 'Test Album' };
      
      mockReleaseRepo.findByDiscogsId.mockResolvedValue(mockRelease);
      mockSuggestionRepo.findByUserAndRelease.mockResolvedValue({
        id: 1,
        releaseId: mockRelease.id,
      });

      await expect(
        service.addToSuggestions(mockUserId, addData),
      ).rejects.toThrow(ConflictException);

      expect(mockDiscogsApiService.addToFolder).not.toHaveBeenCalled();
      expect(mockDiscogsSyncService.syncUserSuggestions).not.toHaveBeenCalled();
    });

    it('should throw error if Discogs API fails', async () => {
      mockReleaseRepo.findByDiscogsId.mockResolvedValue(null);
      mockDiscogsApiService.addToFolder.mockRejectedValue(
        new Error('API Error'),
      );

      await expect(
        service.addToSuggestions(mockUserId, addData),
      ).rejects.toThrow('API Error');

      expect(mockDiscogsApiService.addToFolder).toHaveBeenCalledWith(mockReleaseId);
      expect(mockDiscogsSyncService.syncUserSuggestions).not.toHaveBeenCalled();
    });
  });

  describe('removeFromSuggestions', () => {
    it('should remove release from suggestions successfully', async () => {
      mockSuggestionRepo.findByUserAndRelease.mockResolvedValue({
        id: 1,
        releaseId: mockReleaseId,
      });
      mockSuggestionRepo.removeFromSuggestions.mockResolvedValue(undefined);

      const result = await service.removeFromSuggestions(
        mockUserId,
        mockReleaseId,
      );

      expect(result).toEqual({
        message: 'Release removed from suggestions',
        releaseId: mockReleaseId,
      });
      expect(mockSuggestionRepo.findByUserAndRelease).toHaveBeenCalledWith(
        mockUserId,
        mockReleaseId,
      );
      expect(mockSuggestionRepo.removeFromSuggestions).toHaveBeenCalledWith(
        mockUserId,
        mockReleaseId,
      );
    });

    it('should throw NotFoundException if release not in suggestions', async () => {
      mockSuggestionRepo.findByUserAndRelease.mockResolvedValue(null);

      await expect(
        service.removeFromSuggestions(mockUserId, mockReleaseId),
      ).rejects.toThrow(NotFoundException);

      expect(mockSuggestionRepo.removeFromSuggestions).not.toHaveBeenCalled();
    });
  });

  describe('getUserSuggestions', () => {
    it('should return user suggestions with sorting and pagination', async () => {
      const mockSuggestions = [
        { id: 1, releaseId: 123, title: 'Test Album' },
        { id: 2, releaseId: 456, title: 'Another Album' },
      ];
      
      mockSuggestionRepo.findByUserIdSorted.mockResolvedValue([mockSuggestions, 2]);

      const result = await service.getUserSuggestions(
        mockUserId,
        10,
        0,
        'title',
        'asc',
      );

      expect(result).toEqual({
        data: mockSuggestions,
        total: 2,
        limit: 10,
        offset: 0,
        hasMore: false,
        sortBy: 'title',
        sortOrder: 'ASC',
      });
      expect(mockSuggestionRepo.findByUserIdSorted).toHaveBeenCalledWith(
        mockUserId,
        10,
        0,
        'title',
        'ASC',
      );
    });
  });

  describe('getUserSuggestionsStats', () => {
    it('should return suggestions stats', async () => {
      const mockStats = { totalItems: 5, averageRating: 4.2 };
      mockSuggestionRepo.getSuggestionsStats.mockResolvedValue(mockStats);

      const result = await service.getUserSuggestionsStats(mockUserId);

      expect(result).toEqual(mockStats);
      expect(mockSuggestionRepo.getSuggestionsStats).toHaveBeenCalledWith(mockUserId);
    });
  });
});