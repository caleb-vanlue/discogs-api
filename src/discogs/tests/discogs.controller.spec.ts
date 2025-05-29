import { Test, TestingModule } from '@nestjs/testing';
import { DiscogsController } from '../discogs.controller';
import { DiscogsApiService } from '../discogs-api.service';
import { DiscogsSyncService } from '../discogs-sync.service';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { DiscogsQueryParams } from '../types/discogs.types';

describe('DiscogsController', () => {
  let controller: DiscogsController;

  const mockDiscogsApiService = {
    getCollection: jest.fn(),
    getWantlist: jest.fn(),
  };

  const mockDiscogsSyncService = {
    syncUserCollection: jest.fn(),
    syncUserWantlist: jest.fn(),
    syncAll: jest.fn(),
    getSyncStatus: jest.fn(),
  };

  const mockUserId = 'test-user-123';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscogsController],
      providers: [
        {
          provide: DiscogsApiService,
          useValue: mockDiscogsApiService,
        },
        {
          provide: DiscogsSyncService,
          useValue: mockDiscogsSyncService,
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

  describe('getCollection', () => {
    const mockCollectionResponse = {
      pagination: {
        page: 1,
        pages: 10,
        per_page: 50,
        items: 500,
      },
      releases: [
        {
          id: 123,
          basic_information: {
            title: 'Test Album',
            year: 2023,
          },
        },
      ],
    };

    it('should fetch collection with default parameters', async () => {
      mockDiscogsApiService.getCollection.mockResolvedValue(
        mockCollectionResponse,
      );

      const result = await controller.getCollection();

      expect(result).toEqual(mockCollectionResponse);
      expect(mockDiscogsApiService.getCollection).toHaveBeenCalledWith({
        page: 1,
        perPage: 50,
        sort: undefined,
        sortOrder: undefined,
      });
    });

    it('should fetch collection with custom parameters', async () => {
      mockDiscogsApiService.getCollection.mockResolvedValue(
        mockCollectionResponse,
      );

      const result = await controller.getCollection(2, 25, 'artist', 'desc');

      expect(result).toEqual(mockCollectionResponse);
      expect(mockDiscogsApiService.getCollection).toHaveBeenCalledWith({
        page: 2,
        perPage: 25,
        sort: 'artist',
        sortOrder: 'desc',
      });
    });

    it('should handle all valid sort options', async () => {
      const sortOptions = ['artist', 'title', 'rating', 'added', 'year'];
      mockDiscogsApiService.getCollection.mockResolvedValue(
        mockCollectionResponse,
      );

      for (const sort of sortOptions) {
        await controller.getCollection(1, 50, sort, 'asc');

        expect(mockDiscogsApiService.getCollection).toHaveBeenCalledWith({
          page: 1,
          perPage: 50,
          sort,
          sortOrder: 'asc',
        });
      }
    });

    it('should handle both sort orders', async () => {
      const sortOrders = ['asc', 'desc'];
      mockDiscogsApiService.getCollection.mockResolvedValue(
        mockCollectionResponse,
      );

      for (const sortOrder of sortOrders) {
        await controller.getCollection(1, 50, 'title', sortOrder);

        expect(mockDiscogsApiService.getCollection).toHaveBeenCalledWith({
          page: 1,
          perPage: 50,
          sort: 'title',
          sortOrder,
        });
      }
    });

    it('should log the request', async () => {
      const logSpy = jest.spyOn(controller['logger'], 'log');
      mockDiscogsApiService.getCollection.mockResolvedValue(
        mockCollectionResponse,
      );

      await controller.getCollection();

      expect(logSpy).toHaveBeenCalledWith(
        'Fetching collection from Discogs API',
      );
    });

    it('should handle service errors', async () => {
      const error = new Error('Discogs API error');
      mockDiscogsApiService.getCollection.mockRejectedValue(error);

      await expect(controller.getCollection()).rejects.toThrow(error);
    });
  });

  describe('getWantlist', () => {
    const mockWantlistResponse = {
      pagination: {
        page: 1,
        pages: 5,
        per_page: 50,
        items: 250,
      },
      wants: [
        {
          id: 456,
          basic_information: {
            title: 'Wanted Album',
            year: 2022,
          },
        },
      ],
    };

    it('should fetch wantlist with default parameters', async () => {
      mockDiscogsApiService.getWantlist.mockResolvedValue(mockWantlistResponse);

      const result = await controller.getWantlist();

      expect(result).toEqual(mockWantlistResponse);
      expect(mockDiscogsApiService.getWantlist).toHaveBeenCalledWith({
        page: 1,
        perPage: 50,
      });
    });

    it('should fetch wantlist with custom parameters', async () => {
      mockDiscogsApiService.getWantlist.mockResolvedValue(mockWantlistResponse);

      const result = await controller.getWantlist(3, 100);

      expect(result).toEqual(mockWantlistResponse);
      expect(mockDiscogsApiService.getWantlist).toHaveBeenCalledWith({
        page: 3,
        perPage: 100,
      });
    });

    it('should log the request', async () => {
      const logSpy = jest.spyOn(controller['logger'], 'log');
      mockDiscogsApiService.getWantlist.mockResolvedValue(mockWantlistResponse);

      await controller.getWantlist();

      expect(logSpy).toHaveBeenCalledWith('Fetching wantlist from Discogs API');
    });
  });

  describe('syncCollection', () => {
    const mockSyncResult = {
      totalSynced: 150,
      newItems: 10,
      updatedItems: 5,
      errors: [],
    };

    it('should sync collection for default user', async () => {
      mockDiscogsSyncService.syncUserCollection.mockResolvedValue(
        mockSyncResult,
      );

      const result = await controller.syncCollection();

      expect(result).toEqual({
        message: 'Collection sync completed',
        ...mockSyncResult,
      });
      expect(mockDiscogsSyncService.syncUserCollection).toHaveBeenCalledWith(
        undefined,
      );
    });

    it('should sync collection for specific user', async () => {
      mockDiscogsSyncService.syncUserCollection.mockResolvedValue(
        mockSyncResult,
      );

      const result = await controller.syncCollection(mockUserId);

      expect(result).toEqual({
        message: 'Collection sync completed',
        ...mockSyncResult,
      });
      expect(mockDiscogsSyncService.syncUserCollection).toHaveBeenCalledWith(
        mockUserId,
      );
    });

    it('should log sync start', async () => {
      const logSpy = jest.spyOn(controller['logger'], 'log');
      mockDiscogsSyncService.syncUserCollection.mockResolvedValue(
        mockSyncResult,
      );

      await controller.syncCollection(mockUserId);

      expect(logSpy).toHaveBeenCalledWith(
        `Starting collection sync for user: ${mockUserId}`,
      );
    });

    it('should log default user when userId not provided', async () => {
      const logSpy = jest.spyOn(controller['logger'], 'log');
      mockDiscogsSyncService.syncUserCollection.mockResolvedValue(
        mockSyncResult,
      );

      await controller.syncCollection();

      expect(logSpy).toHaveBeenCalledWith(
        'Starting collection sync for user: default',
      );
    });

    it('should handle sync errors', async () => {
      const error = new Error('Sync failed');
      mockDiscogsSyncService.syncUserCollection.mockRejectedValue(error);

      await expect(controller.syncCollection()).rejects.toThrow(error);
    });
  });

  describe('syncWantlist', () => {
    const mockSyncResult = {
      totalSynced: 25,
      newItems: 3,
      updatedItems: 1,
      errors: [],
    };

    it('should sync wantlist for default user', async () => {
      mockDiscogsSyncService.syncUserWantlist.mockResolvedValue(mockSyncResult);

      const result = await controller.syncWantlist();

      expect(result).toEqual({
        message: 'Wantlist sync completed',
        ...mockSyncResult,
      });
      expect(mockDiscogsSyncService.syncUserWantlist).toHaveBeenCalledWith(
        undefined,
      );
    });

    it('should sync wantlist for specific user', async () => {
      mockDiscogsSyncService.syncUserWantlist.mockResolvedValue(mockSyncResult);

      const result = await controller.syncWantlist(mockUserId);

      expect(result).toEqual({
        message: 'Wantlist sync completed',
        ...mockSyncResult,
      });
      expect(mockDiscogsSyncService.syncUserWantlist).toHaveBeenCalledWith(
        mockUserId,
      );
    });

    it('should log sync start', async () => {
      const logSpy = jest.spyOn(controller['logger'], 'log');
      mockDiscogsSyncService.syncUserWantlist.mockResolvedValue(mockSyncResult);

      await controller.syncWantlist(mockUserId);

      expect(logSpy).toHaveBeenCalledWith(
        `Starting wantlist sync for user: ${mockUserId}`,
      );
    });
  });

  describe('syncAll', () => {
    const mockSyncResult = {
      collection: {
        totalSynced: 150,
        newItems: 10,
        updatedItems: 5,
        errors: [],
      },
      wantlist: {
        totalSynced: 25,
        newItems: 3,
        updatedItems: 1,
        errors: [],
      },
    };

    it('should sync both collection and wantlist', async () => {
      mockDiscogsSyncService.syncAll.mockResolvedValue(mockSyncResult);

      const result = await controller.syncAll();

      expect(result).toEqual({
        message: 'Full sync completed',
        ...mockSyncResult,
      });
      expect(mockDiscogsSyncService.syncAll).toHaveBeenCalledWith(undefined);
    });

    it('should sync for specific user', async () => {
      mockDiscogsSyncService.syncAll.mockResolvedValue(mockSyncResult);

      const result = await controller.syncAll(mockUserId);

      expect(result).toEqual({
        message: 'Full sync completed',
        ...mockSyncResult,
      });
      expect(mockDiscogsSyncService.syncAll).toHaveBeenCalledWith(mockUserId);
    });

    it('should log full sync start', async () => {
      const logSpy = jest.spyOn(controller['logger'], 'log');
      mockDiscogsSyncService.syncAll.mockResolvedValue(mockSyncResult);

      await controller.syncAll(mockUserId);

      expect(logSpy).toHaveBeenCalledWith(
        `Starting full sync for user: ${mockUserId}`,
      );
    });
  });

  describe('getSyncStatus', () => {
    const mockStatusResult = {
      lastSync: new Date('2023-01-01'),
      collectionCount: 150,
      wantlistCount: 25,
      totalReleases: 175,
    };

    it('should get sync status for default user', async () => {
      mockDiscogsSyncService.getSyncStatus.mockResolvedValue(mockStatusResult);

      const result = await controller.getSyncStatus();

      expect(result).toEqual(mockStatusResult);
      expect(mockDiscogsSyncService.getSyncStatus).toHaveBeenCalledWith(
        undefined,
      );
    });

    it('should get sync status for specific user', async () => {
      mockDiscogsSyncService.getSyncStatus.mockResolvedValue(mockStatusResult);

      const result = await controller.getSyncStatus(mockUserId);

      expect(result).toEqual(mockStatusResult);
      expect(mockDiscogsSyncService.getSyncStatus).toHaveBeenCalledWith(
        mockUserId,
      );
    });

    it('should log status request', async () => {
      const logSpy = jest.spyOn(controller['logger'], 'log');
      mockDiscogsSyncService.getSyncStatus.mockResolvedValue(mockStatusResult);

      await controller.getSyncStatus(mockUserId);

      expect(logSpy).toHaveBeenCalledWith(
        `Getting sync status for user: ${mockUserId}`,
      );
    });
  });

  describe('testConnection', () => {
    it('should return success when connection is working', async () => {
      const mockResponse = {
        pagination: { items: 150 },
      };
      mockDiscogsApiService.getCollection.mockResolvedValue(mockResponse);

      const result = await controller.testConnection();

      expect(result).toEqual({
        status: 'success',
        message: 'Discogs API connection successful',
        totalItems: 150,
      });
      expect(mockDiscogsApiService.getCollection).toHaveBeenCalledWith({
        page: 1,
        perPage: 1,
      });
    });

    it('should return error when connection fails', async () => {
      const error = new Error('Connection failed');
      mockDiscogsApiService.getCollection.mockRejectedValue(error);

      const result = await controller.testConnection();

      expect(result).toEqual({
        status: 'error',
        message: 'Discogs API connection failed',
        error: 'Connection failed',
      });
    });

    it('should log connection test', async () => {
      const logSpy = jest.spyOn(controller['logger'], 'log');
      mockDiscogsApiService.getCollection.mockResolvedValue({
        pagination: { items: 0 },
      });

      await controller.testConnection();

      expect(logSpy).toHaveBeenCalledWith('Testing Discogs API connection');
    });

    it('should not throw error when connection fails', async () => {
      mockDiscogsApiService.getCollection.mockRejectedValue(
        new Error('API Error'),
      );

      const result = await controller.testConnection();

      expect(result.status).toBe('error');
      expect(result.error).toBe('API Error');
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
