import { Test, TestingModule } from '@nestjs/testing';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { CollectionController } from '../collection.controller';
import { CollectionService } from '../collection.service';
import {
  CollectionQueryDto,
  WantlistQueryDto,
} from '../dto/collection-query.dto';

describe('CollectionController', () => {
  let controller: CollectionController;

  const mockCollectionService = {
    getUserCollection: jest.fn(),
    getUserWantlist: jest.fn(),
  };

  const mockUserId = 'test-user-123';

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
      .setLogger({
        log: () => {},
        error: () => {},
        warn: () => {},
        debug: () => {},
        verbose: () => {},
      })
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
  });
});
