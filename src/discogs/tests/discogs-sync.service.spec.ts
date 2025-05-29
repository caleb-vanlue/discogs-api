import { Test, TestingModule } from '@nestjs/testing';
import { DiscogsSyncService } from '../discogs-sync.service';
import { DiscogsApiService } from '../discogs-api.service';
import { ReleaseRepository } from '../../release/release.repository';
import { UserCollectionRepository } from '../../collection/repositories/user-collection.repository';
import { UserWantlistRepository } from '../../collection/repositories/user-wantlist.repository';
import { DiscogsConfig } from '../discogs.config';
import { ReleaseDataExtractor } from '../../database/helpers/release-data-extractor';
import { Release } from '../../database/entities/release.entity';
import { DiscogsRelease, BasicInformation } from '../types/discogs.types';

describe('DiscogsSyncService', () => {
  let service: DiscogsSyncService;
  let discogsApiService: DiscogsApiService;
  let releaseRepository: ReleaseRepository;
  let collectionRepository: UserCollectionRepository;
  let wantlistRepository: UserWantlistRepository;
  let discogsConfig: DiscogsConfig;

  const mockDiscogsConfig = {
    apiToken: 'test-token-123',
    username: 'test-user',
    baseUrl: 'https://api.discogs.com',
  };

  const mockDiscogsApiService = {
    getAllCollection: jest.fn(),
    getAllWantlist: jest.fn(),
  };

  const mockReleaseRepository = {
    upsertFromDiscogs: jest.fn(),
  };

  const mockCollectionRepository = {
    findByUserAndRelease: jest.fn(),
    addToCollection: jest.fn(),
    updateCollectionItem: jest.fn(),
    getCollectionStats: jest.fn(),
  };

  const mockWantlistRepository = {
    findByUserAndRelease: jest.fn(),
    addToWantlist: jest.fn(),
    updateWantlistItem: jest.fn(),
    getWantlistStats: jest.fn(),
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
    folder_id: 1,
  };

  const mockRelease: Release = {
    id: 123,
    discogsId: 123,
    title: 'Test Album',
    year: 2023,
    coverImageUrl: 'https://example.com/cover.jpg',
    thumbUrl: 'https://example.com/thumb.jpg',
    genres: ['Rock'],
    styles: ['Alternative Rock'],
    artists: [],
    labels: [],
    formats: [],
    primaryArtist: 'Test Artist',
    primaryLabel: 'Test Label',
    primaryCatno: 'TL001',
    primaryFormat: 'Vinyl',
    primaryGenre: 'Rock',
    primaryStyle: 'Alternative Rock',
    createdAt: new Date(),
    updatedAt: new Date(),
    allArtists: '',
    vinylColor: '',
    catalogNumber: '',
    recordLabel: '',
  } as Release;

  const mockReleaseDataForSorting = {
    title: 'Test Album',
    year: 2023,
    primaryArtist: 'Test Artist',
    primaryLabel: 'Test Label',
    primaryCatno: 'TL001',
    primaryFormat: 'Vinyl',
    primaryGenre: 'Rock',
    primaryStyle: 'Alternative Rock',
    allArtists: '',
    vinylColor: '',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscogsSyncService,
        {
          provide: DiscogsApiService,
          useValue: mockDiscogsApiService,
        },
        {
          provide: ReleaseRepository,
          useValue: mockReleaseRepository,
        },
        {
          provide: UserCollectionRepository,
          useValue: mockCollectionRepository,
        },
        {
          provide: UserWantlistRepository,
          useValue: mockWantlistRepository,
        },
        {
          provide: DiscogsConfig,
          useValue: mockDiscogsConfig,
        },
      ],
    }).compile();

    service = module.get<DiscogsSyncService>(DiscogsSyncService);
    discogsApiService = module.get<DiscogsApiService>(DiscogsApiService);
    releaseRepository = module.get<ReleaseRepository>(ReleaseRepository);
    collectionRepository = module.get<UserCollectionRepository>(
      UserCollectionRepository,
    );
    wantlistRepository = module.get<UserWantlistRepository>(
      UserWantlistRepository,
    );
    discogsConfig = module.get<DiscogsConfig>(DiscogsConfig);

    // Mock ReleaseDataExtractor static method
    jest
      .spyOn(ReleaseDataExtractor, 'copyReleaseDataForSorting')
      .mockReturnValue(mockReleaseDataForSorting);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processNotes', () => {
    it('should return null for undefined notes', () => {
      const result = service['processNotes'](undefined);
      expect(result).toBeNull();
    });

    it('should return the string as-is for string notes', () => {
      const notes = 'Test notes string';
      const result = service['processNotes'](notes);
      expect(result).toBe(notes);
    });

    it('should join array notes with newlines', () => {
      const notes = [
        { field_id: 1, value: 'First note' },
        { field_id: 2, value: 'Second note' },
      ];
      const result = service['processNotes'](notes);
      expect(result).toBe('First note\nSecond note');
    });

    it('should return null for other types', () => {
      const result = service['processNotes'](123 as any);
      expect(result).toBeNull();
    });
  });

  describe('syncRelease', () => {
    it('should sync release successfully', async () => {
      mockReleaseRepository.upsertFromDiscogs.mockResolvedValue(mockRelease);

      const result = await service['syncRelease'](mockDiscogsRelease);

      expect(result).toEqual(mockRelease);
      expect(mockReleaseRepository.upsertFromDiscogs).toHaveBeenCalledWith(
        mockDiscogsRelease.basic_information,
      );
    });

    it('should throw error when release sync fails', async () => {
      mockReleaseRepository.upsertFromDiscogs.mockResolvedValue(null);

      await expect(service['syncRelease'](mockDiscogsRelease)).rejects.toThrow(
        `Failed to sync release ${mockDiscogsRelease.basic_information.id}`,
      );
    });
  });

  describe('syncUserCollection', () => {
    const mockCollectionStats = {
      totalItems: 2,
      ratedItems: 1,
      averageRating: 4.5,
    };

    beforeEach(() => {
      mockDiscogsApiService.getAllCollection.mockResolvedValue([
        mockDiscogsRelease,
      ]);
      mockReleaseRepository.upsertFromDiscogs.mockResolvedValue(mockRelease);
      mockCollectionRepository.getCollectionStats.mockResolvedValue(
        mockCollectionStats,
      );
    });

    it('should sync collection for default user successfully', async () => {
      mockCollectionRepository.findByUserAndRelease.mockResolvedValue(null);

      const result = await service.syncUserCollection();

      expect(result).toEqual({
        synced: 1,
        errors: 0,
        total: 1,
      });

      expect(mockDiscogsApiService.getAllCollection).toHaveBeenCalled();
      expect(
        mockCollectionRepository.findByUserAndRelease,
      ).toHaveBeenCalledWith(mockDiscogsConfig.username, mockRelease.id);
      expect(mockCollectionRepository.addToCollection).toHaveBeenCalledWith({
        userId: mockDiscogsConfig.username,
        releaseId: mockRelease.id,
        discogsInstanceId: mockDiscogsRelease.instance_id,
        folderId: mockDiscogsRelease.folder_id,
        rating: mockDiscogsRelease.rating,
        notes: mockDiscogsRelease.notes,
        dateAdded: new Date(mockDiscogsRelease.date_added as string),
        ...mockReleaseDataForSorting,
      });
    });

    it('should sync collection for specific user', async () => {
      const customUserId = 'custom-user';
      mockCollectionRepository.findByUserAndRelease.mockResolvedValue(null);

      await service.syncUserCollection(customUserId);

      expect(
        mockCollectionRepository.findByUserAndRelease,
      ).toHaveBeenCalledWith(customUserId, mockRelease.id);
      expect(mockCollectionRepository.addToCollection).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: customUserId,
        }),
      );
    });

    it('should update existing collection item', async () => {
      const existingItem = { id: 'existing-123' };
      mockCollectionRepository.findByUserAndRelease.mockResolvedValue(
        existingItem,
      );

      const result = await service.syncUserCollection();

      expect(result).toEqual({
        synced: 1,
        errors: 0,
        total: 1,
      });

      expect(mockCollectionRepository.addToCollection).not.toHaveBeenCalled();
      expect(
        mockCollectionRepository.updateCollectionItem,
      ).toHaveBeenCalledWith(mockDiscogsConfig.username, mockRelease.id, {
        rating: mockDiscogsRelease.rating,
        notes: mockDiscogsRelease.notes,
        ...mockReleaseDataForSorting,
      });
    });

    it('should handle releases with no folder_id', async () => {
      const releaseWithoutFolder = {
        ...mockDiscogsRelease,
        folder_id: undefined,
      };
      mockDiscogsApiService.getAllCollection.mockResolvedValue([
        releaseWithoutFolder,
      ]);
      mockCollectionRepository.findByUserAndRelease.mockResolvedValue(null);

      await service.syncUserCollection();

      expect(mockCollectionRepository.addToCollection).toHaveBeenCalledWith(
        expect.objectContaining({
          folderId: 0,
        }),
      );
    });

    it('should handle releases with no rating', async () => {
      const releaseWithoutRating = {
        ...mockDiscogsRelease,
        rating: undefined,
      };
      mockDiscogsApiService.getAllCollection.mockResolvedValue([
        releaseWithoutRating,
      ]);
      mockCollectionRepository.findByUserAndRelease.mockResolvedValue(null);

      await service.syncUserCollection();

      expect(mockCollectionRepository.addToCollection).toHaveBeenCalledWith(
        expect.objectContaining({
          rating: 0,
        }),
      );
    });

    it('should handle releases with no date_added', async () => {
      const releaseWithoutDate = {
        ...mockDiscogsRelease,
        date_added: undefined,
      };
      mockDiscogsApiService.getAllCollection.mockResolvedValue([
        releaseWithoutDate,
      ]);
      mockCollectionRepository.findByUserAndRelease.mockResolvedValue(null);

      await service.syncUserCollection();

      expect(mockCollectionRepository.addToCollection).toHaveBeenCalledWith(
        expect.objectContaining({
          dateAdded: expect.any(Date),
        }),
      );
    });

    it('should handle releases with no notes', async () => {
      const releaseWithoutNotes = {
        ...mockDiscogsRelease,
        notes: undefined,
      };
      mockDiscogsApiService.getAllCollection.mockResolvedValue([
        releaseWithoutNotes,
      ]);
      mockCollectionRepository.findByUserAndRelease.mockResolvedValue(null);

      await service.syncUserCollection();

      expect(mockCollectionRepository.addToCollection).toHaveBeenCalledWith(
        expect.objectContaining({
          notes: '',
        }),
      );
    });

    it('should handle sync errors for individual releases', async () => {
      const failingRelease = {
        ...mockDiscogsRelease,
        basic_information: {
          ...mockBasicInformation,
          id: 999,
          title: 'Failing Album',
        },
      };

      mockDiscogsApiService.getAllCollection.mockResolvedValue([
        mockDiscogsRelease,
        failingRelease,
      ]);

      mockReleaseRepository.upsertFromDiscogs
        .mockResolvedValueOnce(mockRelease)
        .mockRejectedValueOnce(new Error('Release sync failed'));

      mockCollectionRepository.findByUserAndRelease.mockResolvedValue(null);

      const result = await service.syncUserCollection();

      expect(result).toEqual({
        synced: 1,
        errors: 1,
        total: 2,
      });
    });

    it('should log progress messages', async () => {
      const logSpy = jest.spyOn(service['logger'], 'log');
      const debugSpy = jest.spyOn(service['logger'], 'debug');
      mockCollectionRepository.findByUserAndRelease.mockResolvedValue(null);

      await service.syncUserCollection();

      expect(logSpy).toHaveBeenCalledWith(
        `Starting collection sync for user: ${mockDiscogsConfig.username}`,
      );
      expect(debugSpy).toHaveBeenCalledWith(
        `Synced release: ${mockRelease.title}`,
      );
      expect(logSpy).toHaveBeenCalledWith(
        'Collection sync completed: {"synced":1,"errors":0,"total":1}',
      );
    });

    it('should log error messages for failed syncs', async () => {
      const errorSpy = jest.spyOn(service['logger'], 'error');
      mockReleaseRepository.upsertFromDiscogs.mockRejectedValue(
        new Error('Database error'),
      );

      await service.syncUserCollection();

      expect(errorSpy).toHaveBeenCalledWith(
        `Error syncing release ${mockDiscogsRelease.basic_information.title}:`,
        expect.any(Error),
      );
    });

    it('should throw error when API call fails', async () => {
      const errorSpy = jest.spyOn(service['logger'], 'error');
      const apiError = new Error('API Error');
      mockDiscogsApiService.getAllCollection.mockRejectedValue(apiError);

      await expect(service.syncUserCollection()).rejects.toThrow(apiError);

      expect(errorSpy).toHaveBeenCalledWith(
        'Collection sync failed:',
        apiError,
      );
    });
  });

  describe('syncUserWantlist', () => {
    const mockWantlistStats = {
      totalItems: 3,
    };

    beforeEach(() => {
      mockDiscogsApiService.getAllWantlist.mockResolvedValue([
        mockDiscogsRelease,
      ]);
      mockReleaseRepository.upsertFromDiscogs.mockResolvedValue(mockRelease);
      mockWantlistRepository.getWantlistStats.mockResolvedValue(
        mockWantlistStats,
      );
    });

    it('should sync wantlist for default user successfully', async () => {
      mockWantlistRepository.findByUserAndRelease.mockResolvedValue(null);

      const result = await service.syncUserWantlist();

      expect(result).toEqual({
        synced: 1,
        errors: 0,
        total: 1,
      });

      expect(mockDiscogsApiService.getAllWantlist).toHaveBeenCalled();
      expect(mockWantlistRepository.findByUserAndRelease).toHaveBeenCalledWith(
        mockDiscogsConfig.username,
        mockRelease.id,
      );
      expect(mockWantlistRepository.addToWantlist).toHaveBeenCalledWith({
        userId: mockDiscogsConfig.username,
        releaseId: mockRelease.id,
        notes: mockDiscogsRelease.notes,
        dateAdded: new Date(mockDiscogsRelease.date_added as string),
        ...mockReleaseDataForSorting,
      });
    });

    it('should sync wantlist for specific user', async () => {
      const customUserId = 'custom-user';
      mockWantlistRepository.findByUserAndRelease.mockResolvedValue(null);

      await service.syncUserWantlist(customUserId);

      expect(mockWantlistRepository.findByUserAndRelease).toHaveBeenCalledWith(
        customUserId,
        mockRelease.id,
      );
      expect(mockWantlistRepository.addToWantlist).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: customUserId,
        }),
      );
    });

    it('should update existing wantlist item', async () => {
      const existingItem = { id: 'existing-want-123' };
      mockWantlistRepository.findByUserAndRelease.mockResolvedValue(
        existingItem,
      );

      const result = await service.syncUserWantlist();

      expect(result).toEqual({
        synced: 1,
        errors: 0,
        total: 1,
      });

      expect(mockWantlistRepository.addToWantlist).not.toHaveBeenCalled();
      expect(mockWantlistRepository.updateWantlistItem).toHaveBeenCalledWith(
        mockDiscogsConfig.username,
        mockRelease.id,
        {
          notes: mockDiscogsRelease.notes,
          ...mockReleaseDataForSorting,
        },
      );
    });

    it('should handle wants with no notes', async () => {
      const wantWithoutNotes = {
        ...mockDiscogsRelease,
        notes: undefined,
      };
      mockDiscogsApiService.getAllWantlist.mockResolvedValue([
        wantWithoutNotes,
      ]);
      mockWantlistRepository.findByUserAndRelease.mockResolvedValue(null);

      await service.syncUserWantlist();

      expect(mockWantlistRepository.addToWantlist).toHaveBeenCalledWith(
        expect.objectContaining({
          notes: '',
        }),
      );
    });

    it('should handle wants with no date_added', async () => {
      const wantWithoutDate = {
        ...mockDiscogsRelease,
        date_added: undefined,
      };
      mockDiscogsApiService.getAllWantlist.mockResolvedValue([wantWithoutDate]);
      mockWantlistRepository.findByUserAndRelease.mockResolvedValue(null);

      await service.syncUserWantlist();

      expect(mockWantlistRepository.addToWantlist).toHaveBeenCalledWith(
        expect.objectContaining({
          dateAdded: expect.any(Date),
        }),
      );
    });

    it('should handle sync errors for individual wants', async () => {
      const failingWant = {
        ...mockDiscogsRelease,
        basic_information: {
          ...mockBasicInformation,
          id: 888,
          title: 'Failing Want',
        },
      };

      mockDiscogsApiService.getAllWantlist.mockResolvedValue([
        mockDiscogsRelease,
        failingWant,
      ]);

      mockReleaseRepository.upsertFromDiscogs
        .mockResolvedValueOnce(mockRelease)
        .mockRejectedValueOnce(new Error('Want sync failed'));

      mockWantlistRepository.findByUserAndRelease.mockResolvedValue(null);

      const result = await service.syncUserWantlist();

      expect(result).toEqual({
        synced: 1,
        errors: 1,
        total: 2,
      });
    });

    it('should log progress messages', async () => {
      const logSpy = jest.spyOn(service['logger'], 'log');
      const debugSpy = jest.spyOn(service['logger'], 'debug');
      mockWantlistRepository.findByUserAndRelease.mockResolvedValue(null);

      await service.syncUserWantlist();

      expect(logSpy).toHaveBeenCalledWith(
        `Starting wantlist sync for user: ${mockDiscogsConfig.username}`,
      );
      expect(debugSpy).toHaveBeenCalledWith(
        `Synced want: ${mockRelease.title}`,
      );
      expect(logSpy).toHaveBeenCalledWith(
        'Wantlist sync completed: {"synced":1,"errors":0,"total":1}',
      );
    });

    it('should log error messages for failed syncs', async () => {
      const errorSpy = jest.spyOn(service['logger'], 'error');
      mockReleaseRepository.upsertFromDiscogs.mockRejectedValue(
        new Error('Database error'),
      );

      await service.syncUserWantlist();

      expect(errorSpy).toHaveBeenCalledWith(
        `Error syncing want ${mockDiscogsRelease.basic_information.title}:`,
        expect.any(Error),
      );
    });

    it('should throw error when API call fails', async () => {
      const errorSpy = jest.spyOn(service['logger'], 'error');
      const apiError = new Error('Wantlist API Error');
      mockDiscogsApiService.getAllWantlist.mockRejectedValue(apiError);

      await expect(service.syncUserWantlist()).rejects.toThrow(apiError);

      expect(errorSpy).toHaveBeenCalledWith('Wantlist sync failed:', apiError);
    });
  });

  describe('syncAll', () => {
    const mockCollectionResult = {
      synced: 5,
      errors: 1,
      total: 6,
    };

    const mockWantlistResult = {
      synced: 3,
      errors: 0,
      total: 3,
    };

    beforeEach(() => {
      jest
        .spyOn(service, 'syncUserCollection')
        .mockResolvedValue(mockCollectionResult);
      jest
        .spyOn(service, 'syncUserWantlist')
        .mockResolvedValue(mockWantlistResult);
    });

    it('should sync both collection and wantlist for default user', async () => {
      const result = await service.syncAll();

      expect(result).toEqual({
        collection: mockCollectionResult,
        wantlist: mockWantlistResult,
      });

      expect(service.syncUserCollection).toHaveBeenCalledWith(
        mockDiscogsConfig.username,
      );
      expect(service.syncUserWantlist).toHaveBeenCalledWith(
        mockDiscogsConfig.username,
      );
    });

    it('should sync both collection and wantlist for specific user', async () => {
      const customUserId = 'custom-user';

      const result = await service.syncAll(customUserId);

      expect(result).toEqual({
        collection: mockCollectionResult,
        wantlist: mockWantlistResult,
      });

      expect(service.syncUserCollection).toHaveBeenCalledWith(customUserId);
      expect(service.syncUserWantlist).toHaveBeenCalledWith(customUserId);
    });

    it('should run collection and wantlist sync in parallel', async () => {
      const startTime = Date.now();

      // Make the methods take some time to ensure they run in parallel
      jest
        .spyOn(service, 'syncUserCollection')
        .mockImplementation(
          () =>
            new Promise((resolve) =>
              setTimeout(() => resolve(mockCollectionResult), 100),
            ),
        );
      jest
        .spyOn(service, 'syncUserWantlist')
        .mockImplementation(
          () =>
            new Promise((resolve) =>
              setTimeout(() => resolve(mockWantlistResult), 100),
            ),
        );

      await service.syncAll();

      const endTime = Date.now();

      // If they ran in parallel, total time should be less than sequential (200ms)
      expect(endTime - startTime).toBeLessThan(150);
    });

    it('should log progress messages', async () => {
      const logSpy = jest.spyOn(service['logger'], 'log');

      await service.syncAll();

      expect(logSpy).toHaveBeenCalledWith(
        `Starting full sync for user: ${mockDiscogsConfig.username}`,
      );
      expect(logSpy).toHaveBeenCalledWith(
        'Full sync completed: {"collection":{"synced":5,"errors":1,"total":6},"wantlist":{"synced":3,"errors":0,"total":3}}',
      );
    });

    it('should handle errors from either sync operation', async () => {
      const collectionError = new Error('Collection sync failed');
      jest
        .spyOn(service, 'syncUserCollection')
        .mockRejectedValue(collectionError);

      await expect(service.syncAll()).rejects.toThrow(collectionError);
    });
  });

  describe('getSyncStatus', () => {
    const mockCollectionStats = {
      totalItems: 150,
      ratedItems: 75,
      averageRating: 4.2,
    };

    const mockWantlistStats = {
      totalItems: 25,
    };

    beforeEach(() => {
      mockCollectionRepository.getCollectionStats.mockResolvedValue(
        mockCollectionStats,
      );
      mockWantlistRepository.getWantlistStats.mockResolvedValue(
        mockWantlistStats,
      );
    });

    it('should get sync status for default user', async () => {
      const result = await service.getSyncStatus();

      expect(result).toEqual({
        userId: mockDiscogsConfig.username,
        lastSyncAttempt: expect.any(String),
        collection: {
          totalItems: 150,
          ratedItems: 75,
          averageRating: 4.2,
        },
        wantlist: {
          totalItems: 25,
        },
        summary: {
          totalSyncedItems: 175,
        },
      });

      expect(mockCollectionRepository.getCollectionStats).toHaveBeenCalledWith(
        mockDiscogsConfig.username,
      );
      expect(mockWantlistRepository.getWantlistStats).toHaveBeenCalledWith(
        mockDiscogsConfig.username,
      );
    });

    it('should get sync status for specific user', async () => {
      const customUserId = 'custom-user';

      const result = await service.getSyncStatus(customUserId);

      expect(result.userId).toBe(customUserId);
      expect(mockCollectionRepository.getCollectionStats).toHaveBeenCalledWith(
        customUserId,
      );
      expect(mockWantlistRepository.getWantlistStats).toHaveBeenCalledWith(
        customUserId,
      );
    });

    it('should return ISO string for lastSyncAttempt', async () => {
      const result = await service.getSyncStatus();

      expect(result.lastSyncAttempt).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
    });

    it('should calculate total synced items correctly', async () => {
      const result = await service.getSyncStatus();

      expect(result.summary.totalSyncedItems).toBe(
        mockCollectionStats.totalItems + mockWantlistStats.totalItems,
      );
    });

    it('should run stats queries in parallel', async () => {
      const startTime = Date.now();

      // Make the methods take some time to ensure they run in parallel
      mockCollectionRepository.getCollectionStats.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(mockCollectionStats), 50),
          ),
      );
      mockWantlistRepository.getWantlistStats.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(mockWantlistStats), 50),
          ),
      );

      await service.getSyncStatus();

      const endTime = Date.now();

      // If they ran in parallel, total time should be less than sequential (100ms)
      expect(endTime - startTime).toBeLessThan(80);
    });

    it('should handle errors from stats queries', async () => {
      const statsError = new Error('Stats query failed');
      mockCollectionRepository.getCollectionStats.mockRejectedValue(statsError);

      await expect(service.getSyncStatus()).rejects.toThrow(statsError);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle empty collection response', async () => {
      mockDiscogsApiService.getAllCollection.mockResolvedValue([]);

      const result = await service.syncUserCollection();

      expect(result).toEqual({
        synced: 0,
        errors: 0,
        total: 0,
      });
    });

    it('should handle empty wantlist response', async () => {
      mockDiscogsApiService.getAllWantlist.mockResolvedValue([]);

      const result = await service.syncUserWantlist();

      expect(result).toEqual({
        synced: 0,
        errors: 0,
        total: 0,
      });
    });

    it('should handle malformed notes arrays', async () => {
      const malformedNotes = [
        { field_id: 1, value: 'Good note' },
        { field_id: 2 }, // Missing value
        { value: 'No field_id' }, // Missing field_id
      ] as any;

      const result = service['processNotes'](malformedNotes);
      expect(result).toBe('Good note\n\nNo field_id');
    });

    it('should handle database connection errors gracefully', async () => {
      mockDiscogsApiService.getAllCollection.mockResolvedValue([
        mockDiscogsRelease,
      ]);
      mockReleaseRepository.upsertFromDiscogs.mockRejectedValue(
        new Error('Database connection lost'),
      );

      const result = await service.syncUserCollection();

      expect(result.errors).toBe(1);
      expect(result.synced).toBe(0);
      expect(result.total).toBe(1);
    });
  });
});
