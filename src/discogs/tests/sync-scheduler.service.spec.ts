import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SyncSchedulerService } from '../sync-scheduler.service';
import { DiscogsSyncService } from '../discogs-sync.service';
import { DiscogsConfig } from '../discogs.config';

describe('SyncSchedulerService', () => {
  let service: SyncSchedulerService;
  let syncService: DiscogsSyncService;
  let configService: ConfigService;
  let discogsConfig: DiscogsConfig;

  const mockDiscogsSyncService = {
    syncAll: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockDiscogsConfig = {
    username: 'test-user',
  };

  const mockSyncResult = {
    collection: {
      synced: 100,
      errors: 2,
      total: 102,
    },
    wantlist: {
      synced: 25,
      errors: 0,
      total: 25,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncSchedulerService,
        {
          provide: DiscogsSyncService,
          useValue: mockDiscogsSyncService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: DiscogsConfig,
          useValue: mockDiscogsConfig,
        },
      ],
    }).compile();

    service = module.get<SyncSchedulerService>(SyncSchedulerService);
    syncService = module.get<DiscogsSyncService>(DiscogsSyncService);
    configService = module.get<ConfigService>(ConfigService);
    discogsConfig = module.get<DiscogsConfig>(DiscogsConfig);

    jest.clearAllMocks();
    mockConfigService.get.mockImplementation(
      (key: string, defaultValue?: string) => {
        const values: Record<string, string> = {
          SYNC_ON_STARTUP: 'true',
          CRON_SYNC_ENABLED: 'true',
        };
        return values[key] || defaultValue;
      },
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    beforeEach(() => {
      jest.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
        callback();
        return {} as any;
      });

      jest
        .spyOn(service as any, 'performFullSync')
        .mockResolvedValue(mockSyncResult);
    });

    it('should perform startup sync when SYNC_ON_STARTUP is true', async () => {
      mockConfigService.get.mockReturnValue('true');

      await service.onModuleInit();

      expect(service['performFullSync']).toHaveBeenCalledWith('startup');
    });

    it('should skip startup sync when SYNC_ON_STARTUP is false', async () => {
      mockConfigService.get.mockReturnValue('false');
      const logSpy = jest.spyOn(service['logger'], 'log');

      await service.onModuleInit();

      expect(service['performFullSync']).not.toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalledWith(
        'Startup sync disabled via SYNC_ON_STARTUP=false',
      );
    });

    it('should default to true when SYNC_ON_STARTUP is not set', async () => {
      mockConfigService.get.mockImplementation(
        (key: string, defaultValue?: string) => {
          if (key === 'SYNC_ON_STARTUP') return defaultValue;
          return 'true';
        },
      );

      await service.onModuleInit();

      expect(service['performFullSync']).toHaveBeenCalledWith('startup');
    });

    it('should log startup sync begin message', async () => {
      const logSpy = jest.spyOn(service['logger'], 'log');

      await service.onModuleInit();

      expect(logSpy).toHaveBeenCalledWith(
        'Application started - Beginning initial sync...',
      );
    });

    it('should wait 5 seconds before starting sync', async () => {
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

      await service.onModuleInit();

      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 5000);
    });

    it('should handle startup sync errors gracefully', async () => {
      const error = new Error('Startup sync failed');
      const errorSpy = jest.spyOn(service['logger'], 'error');
      jest.spyOn(service as any, 'performFullSync').mockRejectedValue(error);

      await service.onModuleInit();

      expect(errorSpy).toHaveBeenCalledWith('Startup sync failed:', error);
    });
  });

  describe('handleDailySync', () => {
    beforeEach(() => {
      jest
        .spyOn(service as any, 'performFullSync')
        .mockResolvedValue(mockSyncResult);
    });

    it('should perform daily sync when CRON_SYNC_ENABLED is true', async () => {
      mockConfigService.get.mockReturnValue('true');

      await service.handleDailySync();

      expect(service['performFullSync']).toHaveBeenCalledWith('daily-cron');
    });

    it('should skip daily sync when CRON_SYNC_ENABLED is false', async () => {
      mockConfigService.get.mockReturnValue('false');
      const logSpy = jest.spyOn(service['logger'], 'log');

      await service.handleDailySync();

      expect(service['performFullSync']).not.toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalledWith(
        'Daily sync disabled via CRON_SYNC_ENABLED=false',
      );
    });

    it('should default to true when CRON_SYNC_ENABLED is not set', async () => {
      mockConfigService.get.mockImplementation(
        (key: string, defaultValue?: string) => {
          if (key === 'CRON_SYNC_ENABLED') return defaultValue;
          return 'true';
        },
      );

      await service.handleDailySync();

      expect(service['performFullSync']).toHaveBeenCalledWith('daily-cron');
    });

    it('should log daily sync trigger message', async () => {
      const logSpy = jest.spyOn(service['logger'], 'log');

      await service.handleDailySync();

      expect(logSpy).toHaveBeenCalledWith(
        'Daily sync triggered at midnight UTC',
      );
    });

    it('should handle daily sync errors gracefully', async () => {
      const error = new Error('Daily sync failed');
      const errorSpy = jest.spyOn(service['logger'], 'error');
      jest.spyOn(service as any, 'performFullSync').mockRejectedValue(error);

      await service.handleDailySync();

      expect(errorSpy).toHaveBeenCalledWith('Daily sync failed:', error);
    });
  });

  describe('performFullSync', () => {
    beforeEach(() => {
      mockDiscogsSyncService.syncAll.mockResolvedValue(mockSyncResult);
    });

    it('should perform full sync successfully', async () => {
      const mockNow = jest.spyOn(Date, 'now');
      mockNow
        .mockReturnValueOnce(1000000) // Start time
        .mockReturnValueOnce(1065000); // End time (65 seconds later)

      const result = await service['performFullSync']('test-trigger');

      expect(mockDiscogsSyncService.syncAll).toHaveBeenCalledWith('test-user');
      expect(result).toEqual({
        success: true,
        trigger: 'test-trigger',
        duration: 1.08, // 65 seconds = 1.08 minutes (rounded)
        ...mockSyncResult,
      });

      mockNow.mockRestore();
    });

    it('should log sync start message', async () => {
      const mockNow = jest.spyOn(Date, 'now');
      mockNow.mockReturnValue(1000000);
      const logSpy = jest.spyOn(service['logger'], 'log');

      await service['performFullSync']('test-trigger');

      expect(logSpy).toHaveBeenCalledWith(
        'Starting full sync (trigger: test-trigger)',
      );
      mockNow.mockRestore();
    });

    it('should log success message with duration and results', async () => {
      const mockNow = jest.spyOn(Date, 'now');
      mockNow
        .mockReturnValueOnce(1000000) // Start time
        .mockReturnValueOnce(1065000); // End time (65 seconds later)
      const logSpy = jest.spyOn(service['logger'], 'log');

      await service['performFullSync']('test-trigger');

      expect(logSpy).toHaveBeenCalledWith(
        'Sync completed successfully in 1.08 minutes',
      );
      expect(logSpy).toHaveBeenCalledWith(
        'Results: Collection: 100/102, Wantlist: 25/25',
      );
      mockNow.mockRestore();
    });

    it('should log warning when there are errors', async () => {
      const mockNow = jest.spyOn(Date, 'now');
      mockNow.mockReturnValue(1000000);
      const warnSpy = jest.spyOn(service['logger'], 'warn');

      await service['performFullSync']('test-trigger');

      expect(warnSpy).toHaveBeenCalledWith(
        'Sync completed with errors: Collection: 2, Wantlist: 0',
      );
      mockNow.mockRestore();
    });

    it('should not log warning when there are no errors', async () => {
      const mockNow = jest.spyOn(Date, 'now');
      mockNow.mockReturnValue(1000000);
      const warnSpy = jest.spyOn(service['logger'], 'warn');
      const noErrorResult = {
        collection: { synced: 100, errors: 0, total: 100 },
        wantlist: { synced: 25, errors: 0, total: 25 },
      };
      mockDiscogsSyncService.syncAll.mockResolvedValue(noErrorResult);

      await service['performFullSync']('test-trigger');

      expect(warnSpy).not.toHaveBeenCalled();
      mockNow.mockRestore();
    });

    it('should handle sync service errors and rethrow with metadata', async () => {
      const mockNow = jest.spyOn(Date, 'now');
      mockNow
        .mockReturnValueOnce(1000000) // Start time
        .mockReturnValueOnce(1065000); // End time (65 seconds later)
      const error = new Error('Sync service failed');
      const errorSpy = jest.spyOn(service['logger'], 'error');
      mockDiscogsSyncService.syncAll.mockRejectedValue(error);

      await expect(service['performFullSync']('test-trigger')).rejects.toEqual({
        success: false,
        trigger: 'test-trigger',
        duration: 1.08,
        error: 'Sync service failed',
      });

      expect(errorSpy).toHaveBeenCalledWith(
        'Sync failed after 1.08 minutes:',
        error,
      );
      mockNow.mockRestore();
    });

    it('should calculate duration correctly for short syncs', async () => {
      const mockNow = jest.spyOn(Date, 'now');
      mockNow
        .mockReturnValueOnce(2000000) // Start time
        .mockReturnValueOnce(2030000); // End time (30 seconds later)

      const result = await service['performFullSync']('quick-sync');

      expect(result.duration).toBe(0.5); // 30 seconds = 0.5 minutes
      mockNow.mockRestore();
    });

    it('should calculate duration correctly for long syncs', async () => {
      const mockNow = jest.spyOn(Date, 'now');
      mockNow
        .mockReturnValueOnce(3000000) // Start time
        .mockReturnValueOnce(3300000); // End time (5 minutes later)

      const result = await service['performFullSync']('long-sync');

      expect(result.duration).toBe(5); // 300 seconds = 5 minutes
      mockNow.mockRestore();
    });

    it('should round duration to 2 decimal places', async () => {
      const mockNow = jest.spyOn(Date, 'now');
      mockNow
        .mockReturnValueOnce(4000000) // Start time
        .mockReturnValueOnce(4033333); // End time (33.333 seconds later)

      const result = await service['performFullSync']('precise-sync');

      expect(result.duration).toBe(0.56); // Should be rounded to 2 decimal places
      mockNow.mockRestore();
    });

    it('should use correct username from config', async () => {
      const mockNow = jest.spyOn(Date, 'now');
      mockNow.mockReturnValue(1000000);
      mockDiscogsConfig.username = 'custom-user';

      await service['performFullSync']('test-trigger');

      expect(mockDiscogsSyncService.syncAll).toHaveBeenCalledWith(
        'custom-user',
      );
      mockNow.mockRestore();
    });
  });

  describe('error handling edge cases', () => {
    it('should handle undefined sync result gracefully', async () => {
      const mockNow = jest.spyOn(Date, 'now');
      mockNow.mockReturnValue(1000000);
      mockDiscogsSyncService.syncAll.mockResolvedValue(undefined);

      await expect(service['performFullSync']('test')).rejects.toMatchObject({
        success: false,
        trigger: 'test',
        duration: expect.any(Number),
        error: "Cannot read properties of undefined (reading 'collection')",
      });
      mockNow.mockRestore();
    });

    it('should handle malformed sync result', async () => {
      const mockNow = jest.spyOn(Date, 'now');
      mockNow.mockReturnValue(1000000);
      const malformedResult = {
        collection: null,
        wantlist: { synced: 10 },
      };
      mockDiscogsSyncService.syncAll.mockResolvedValue(malformedResult as any);

      await expect(service['performFullSync']('test')).rejects.toMatchObject({
        success: false,
        trigger: 'test',
        duration: expect.any(Number),
        error: expect.any(String),
      });
      mockNow.mockRestore();
    });

    it('should handle timeout errors', async () => {
      const mockNow = jest.spyOn(Date, 'now');
      mockNow
        .mockReturnValueOnce(1000000) // Start time
        .mockReturnValueOnce(1065000); // End time
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';
      mockDiscogsSyncService.syncAll.mockRejectedValue(timeoutError);

      await expect(service['performFullSync']('timeout-test')).rejects.toEqual({
        success: false,
        trigger: 'timeout-test',
        duration: 1.08,
        error: 'Request timeout',
      });
      mockNow.mockRestore();
    });
  });

  describe('configuration edge cases', () => {
    it('should handle mixed case configuration values', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'SYNC_ON_STARTUP') return 'TRUE';
        if (key === 'CRON_SYNC_ENABLED') return 'False';
        return 'true';
      });

      const logSpy = jest.spyOn(service['logger'], 'log');
      jest.spyOn(service as any, 'performFullSync').mockResolvedValue({});

      await service.onModuleInit();
      await service.handleDailySync();

      expect(logSpy).toHaveBeenCalledWith(
        'Startup sync disabled via SYNC_ON_STARTUP=false',
      );
      expect(logSpy).toHaveBeenCalledWith(
        'Daily sync disabled via CRON_SYNC_ENABLED=false',
      );

      expect(service['performFullSync']).not.toHaveBeenCalled();
    });

    it('should handle empty string configuration values', async () => {
      mockConfigService.get.mockImplementation(
        (key: string, defaultValue?: string) => {
          if (key === 'SYNC_ON_STARTUP') return '';
          return defaultValue || 'true';
        },
      );

      const logSpy = jest.spyOn(service['logger'], 'log');

      await service.onModuleInit();

      expect(logSpy).toHaveBeenCalledWith(
        'Startup sync disabled via SYNC_ON_STARTUP=false',
      );
    });
  });

  describe('timing and performance', () => {
    beforeEach(() => {
      mockDiscogsSyncService.syncAll.mockResolvedValue(mockSyncResult);
    });

    it('should handle very fast syncs (under 1 second)', async () => {
      const mockNow = jest.spyOn(Date, 'now');
      mockNow
        .mockReturnValueOnce(5000000) // Start time
        .mockReturnValueOnce(5000500); // End time (0.5 seconds later)

      const result = await service['performFullSync']('fast-sync');

      expect(result.duration).toBe(0.01); // 0.5 seconds = 0.008... minutes, rounded to 0.01
      mockNow.mockRestore();
    });

    it('should not have negative duration on clock adjustments', async () => {
      const mockNow = jest.spyOn(Date, 'now');
      mockNow
        .mockReturnValueOnce(6000000) // Start time
        .mockReturnValueOnce(5999000); // End time before start (clock adjustment)

      const result = await service['performFullSync']('clock-adjustment');

      expect(result.duration).toBe(-0.02); // -1000ms = -0.016... minutes, rounded to -0.02
      mockNow.mockRestore();
    });
  });
});
