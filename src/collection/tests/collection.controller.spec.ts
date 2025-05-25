import { Test, TestingModule } from '@nestjs/testing';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { CollectionController } from '../collection.controller';
import { CollectionService } from '../collection.service';
import { AddToCollectionDto } from '../dto/add-to-collection.dto';
import { AddToWantlistDto } from '../dto/add-to-wantlist.dto';
import {
  CollectionQueryDto,
  WantlistQueryDto,
} from '../dto/collection-query.dto';

describe('CollectionController', () => {
  let controller: CollectionController;

  const mockCollectionService = {
    getUserCollection: jest.fn(),
    getUserWantlist: jest.fn(),
    getUserStats: jest.fn(),
    getCollectionSortOptions: jest.fn(),
    getWantlistSortOptions: jest.fn(),
    addToCollection: jest.fn(),
    addToWantlist: jest.fn(),
    removeFromCollection: jest.fn(),
    removeFromWantlist: jest.fn(),
  };

  const mockUserId = 'test-user-123';
  const mockReleaseId = 12345;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollectionController],
      providers: [
        {
          provide: CollectionService,
          useValue: mockCollectionService,
        },
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<CollectionController>(CollectionController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserCollection', () => {
    it('should return user collection with default query parameters', async () => {
      const mockCollection = {
        releases: [{ id: 1, title: 'Test Album' }],
        pagination: { total: 1, limit: 50, offset: 0 },
      };
      const query: CollectionQueryDto = {};
      mockCollectionService.getUserCollection.mockResolvedValue(mockCollection);
      const result = await controller.getUserCollection(mockUserId, query);

      expect(result).toEqual(mockCollection);
      expect(mockCollectionService.getUserCollection).toHaveBeenCalledWith(
        mockUserId,
        undefined,
        undefined,
        undefined,
        undefined,
      );
    });

    it('should return user collection with custom query parameters', async () => {
      const mockCollection = {
        releases: [{ id: 1, title: 'Test Album' }],
        pagination: { total: 1, limit: 10, offset: 20 },
      };
      const query: CollectionQueryDto = {
        limit: 10,
        offset: 20,
        sort_by: 'primaryArtist',
        sort_order: 'desc',
      };

      mockCollectionService.getUserCollection.mockResolvedValue(mockCollection);
      const result = await controller.getUserCollection(mockUserId, query);

      expect(result).toEqual(mockCollection);
      expect(mockCollectionService.getUserCollection).toHaveBeenCalledWith(
        mockUserId,
        10,
        20,
        'primaryArtist',
        'desc',
      );
    });

    it('should handle service errors', async () => {
      const query: CollectionQueryDto = {};
      const error = new Error('Service error');

      mockCollectionService.getUserCollection.mockRejectedValue(error);

      await expect(
        controller.getUserCollection(mockUserId, query),
      ).rejects.toThrow(error);
    });
  });

  describe('getUserWantlist', () => {
    it('should return user wantlist with default query parameters', async () => {
      const mockWantlist = {
        releases: [{ id: 2, title: 'Wanted Album' }],
        pagination: { total: 1, limit: 50, offset: 0 },
      };
      const query: WantlistQueryDto = {};
      mockCollectionService.getUserWantlist.mockResolvedValue(mockWantlist);
      const result = await controller.getUserWantlist(mockUserId, query);

      expect(result).toEqual(mockWantlist);
      expect(mockCollectionService.getUserWantlist).toHaveBeenCalledWith(
        mockUserId,
        undefined,
        undefined,
        undefined,
        undefined,
      );
    });

    it('should return user wantlist with custom query parameters', async () => {
      const mockWantlist = {
        releases: [{ id: 2, title: 'Wanted Album' }],
        pagination: { total: 1, limit: 25, offset: 50 },
      };
      const query: WantlistQueryDto = {
        limit: 25,
        offset: 50,
        sort_by: 'dateAdded',
        sort_order: 'asc',
      };

      mockCollectionService.getUserWantlist.mockResolvedValue(mockWantlist);

      const result = await controller.getUserWantlist(mockUserId, query);

      expect(result).toEqual(mockWantlist);
      expect(mockCollectionService.getUserWantlist).toHaveBeenCalledWith(
        mockUserId,
        25,
        50,
        'dateAdded',
        'asc',
      );
    });
  });

  describe('getUserStats', () => {
    it('should return user collection and wantlist stats', async () => {
      const mockStats = {
        collection: { total: 150, genres: { rock: 50, jazz: 30 } },
        wantlist: { total: 25, genres: { electronic: 15, hip_hop: 10 } },
      };
      mockCollectionService.getUserStats.mockResolvedValue(mockStats);
      const result = await controller.getUserStats(mockUserId);

      expect(result).toEqual(mockStats);
      expect(mockCollectionService.getUserStats).toHaveBeenCalledWith(
        mockUserId,
      );
    });

    it('should handle service errors', async () => {
      const error = new Error('Stats retrieval failed');
      mockCollectionService.getUserStats.mockRejectedValue(error);
      await expect(controller.getUserStats(mockUserId)).rejects.toThrow(error);
    });
  });

  describe('getSortOptions', () => {
    it('should return available sort options for collection and wantlist', async () => {
      const mockCollectionOptions = ['artist', 'title', 'year', 'date_added'];
      const mockWantlistOptions = ['artist', 'title', 'date_added'];

      mockCollectionService.getCollectionSortOptions.mockReturnValue(
        mockCollectionOptions,
      );
      mockCollectionService.getWantlistSortOptions.mockReturnValue(
        mockWantlistOptions,
      );

      const result = await controller.getSortOptions();

      expect(result).toEqual({
        collection: mockCollectionOptions,
        wantlist: mockWantlistOptions,
      });
      expect(mockCollectionService.getCollectionSortOptions).toHaveBeenCalled();
      expect(mockCollectionService.getWantlistSortOptions).toHaveBeenCalled();
    });
  });

  describe('addToCollection', () => {
    it('should add a release to collection successfully', async () => {
      const addDto: AddToCollectionDto = {
        releaseId: mockReleaseId,
        notes: 'Great condition',
      };
      const mockResponse = {
        message: 'Release added to collection',
        release: { id: mockReleaseId },
      };
      mockCollectionService.addToCollection.mockResolvedValue(mockResponse);
      const result = await controller.addToCollection(mockUserId, addDto);

      expect(result).toEqual(mockResponse);
      expect(mockCollectionService.addToCollection).toHaveBeenCalledWith(
        mockUserId,
        addDto,
      );
    });

    it('should handle duplicate release error', async () => {
      const addDto: AddToCollectionDto = {
        releaseId: mockReleaseId,
      };
      const error = new Error('Release already in collection');
      mockCollectionService.addToCollection.mockRejectedValue(error);

      await expect(
        controller.addToCollection(mockUserId, addDto),
      ).rejects.toThrow(error);
    });
  });

  describe('addToWantlist', () => {
    it('should add a release to wantlist successfully', async () => {
      const addDto: AddToWantlistDto = {
        releaseId: mockReleaseId,
        notes: 'Really want this!',
      };
      const mockResponse = {
        message: 'Release added to wantlist',
        release: { id: mockReleaseId },
      };

      mockCollectionService.addToWantlist.mockResolvedValue(mockResponse);
      const result = await controller.addToWantlist(mockUserId, addDto);

      expect(result).toEqual(mockResponse);
      expect(mockCollectionService.addToWantlist).toHaveBeenCalledWith(
        mockUserId,
        addDto,
      );
    });
  });

  describe('removeFromCollection', () => {
    it('should remove a release from collection successfully', async () => {
      const mockResponse = {
        message: 'Release removed from collection',
        releaseId: mockReleaseId,
      };
      mockCollectionService.removeFromCollection.mockResolvedValue(
        mockResponse,
      );
      const result = await controller.removeFromCollection(
        mockUserId,
        mockReleaseId,
      );

      expect(result).toEqual(mockResponse);
      expect(mockCollectionService.removeFromCollection).toHaveBeenCalledWith(
        mockUserId,
        mockReleaseId,
      );
    });

    it('should handle not found error', async () => {
      const error = new Error('Release not found in collection');
      mockCollectionService.removeFromCollection.mockRejectedValue(error);
      await expect(
        controller.removeFromCollection(mockUserId, mockReleaseId),
      ).rejects.toThrow(error);
    });
  });

  describe('removeFromWantlist', () => {
    it('should remove a release from wantlist successfully', async () => {
      const mockResponse = {
        message: 'Release removed from wantlist',
        releaseId: mockReleaseId,
      };
      mockCollectionService.removeFromWantlist.mockResolvedValue(mockResponse);
      const result = await controller.removeFromWantlist(
        mockUserId,
        mockReleaseId,
      );

      expect(result).toEqual(mockResponse);
      expect(mockCollectionService.removeFromWantlist).toHaveBeenCalledWith(
        mockUserId,
        mockReleaseId,
      );
    });

    it('should handle not found error', async () => {
      const error = new Error('Release not found in wantlist');
      mockCollectionService.removeFromWantlist.mockRejectedValue(error);

      await expect(
        controller.removeFromWantlist(mockUserId, mockReleaseId),
      ).rejects.toThrow(error);
    });
  });

  describe('ApiKeyGuard', () => {
    it('should have ApiKeyGuard applied to controller', () => {
      const guards = Reflect.getMetadata('__guards__', CollectionController);
      const guard = new guards[0]();

      expect(guard).toBeInstanceOf(ApiKeyGuard);
    });
  });

  describe('Logger', () => {
    it('should log when getting user collection', async () => {
      const query: CollectionQueryDto = {
        sort_by: 'primaryArtist',
        sort_order: 'asc',
      };
      const logSpy = jest.spyOn(controller['logger'], 'log');
      mockCollectionService.getUserCollection.mockResolvedValue({});
      await controller.getUserCollection(mockUserId, query);

      expect(logSpy).toHaveBeenCalledWith(
        `Getting collection for user ${mockUserId} - sort: primaryArtist asc`,
      );
    });

    it('should log when getting user wantlist', async () => {
      const query: WantlistQueryDto = {
        sort_by: 'dateAdded',
        sort_order: 'desc',
      };
      const logSpy = jest.spyOn(controller['logger'], 'log');
      mockCollectionService.getUserWantlist.mockResolvedValue({});
      await controller.getUserWantlist(mockUserId, query);

      expect(logSpy).toHaveBeenCalledWith(
        `Getting wantlist for user ${mockUserId} - sort: dateAdded desc`,
      );
    });

    it('should log when adding to collection', async () => {
      const addDto: AddToCollectionDto = { releaseId: mockReleaseId };
      const logSpy = jest.spyOn(controller['logger'], 'log');
      mockCollectionService.addToCollection.mockResolvedValue({});
      await controller.addToCollection(mockUserId, addDto);

      expect(logSpy).toHaveBeenCalledWith(
        `Adding release ${mockReleaseId} to collection for user ${mockUserId}`,
      );
    });
  });
});
