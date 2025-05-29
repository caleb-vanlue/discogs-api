import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiKeyGuard } from '../api-key.guard';

describe('ApiKeyGuard', () => {
  let guard: ApiKeyGuard;

  const mockConfigService = {
    get: jest.fn(),
  };

  const validApiKey = 'valid-api-key-123';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeyGuard,
        {
          provide: ConfigService,
          useValue: mockConfigService,
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

    guard = module.get<ApiKeyGuard>(ApiKeyGuard);
    mockConfigService.get.mockReturnValue(validApiKey);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  function createMockExecutionContext(headers: any = {}): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers,
        }),
      }),
    } as ExecutionContext;
  }

  describe('canActivate', () => {
    describe('Authorization header with Bearer token', () => {
      it('should return true when valid API key is provided in Authorization header', () => {
        const context = createMockExecutionContext({
          authorization: `Bearer ${validApiKey}`,
        });

        const result = guard.canActivate(context);

        expect(result).toBe(true);
        expect(mockConfigService.get).toHaveBeenCalledWith('app.apiKey');
      });

      it('should throw UnauthorizedException when invalid API key in Authorization header', () => {
        const context = createMockExecutionContext({
          authorization: 'Bearer invalid-key',
        });

        expect(() => guard.canActivate(context)).toThrow(
          new UnauthorizedException('Invalid API key'),
        );
      });

      it('should handle Authorization header without Bearer prefix', () => {
        const context = createMockExecutionContext({
          authorization: validApiKey,
        });

        expect(() => guard.canActivate(context)).toThrow(
          new UnauthorizedException('API key is required'),
        );
      });
    });

    describe('X-API-Key header', () => {
      it('should return true when valid API key is provided in X-API-Key header', () => {
        const context = createMockExecutionContext({
          'x-api-key': validApiKey,
        });

        const result = guard.canActivate(context);

        expect(result).toBe(true);
      });

      it('should throw UnauthorizedException when invalid API key in X-API-Key header', () => {
        const context = createMockExecutionContext({
          'x-api-key': 'invalid-key',
        });

        expect(() => guard.canActivate(context)).toThrow(
          new UnauthorizedException('Invalid API key'),
        );
      });
    });

    describe('API-Key header', () => {
      it('should return true when valid API key is provided in API-Key header', () => {
        const context = createMockExecutionContext({
          'api-key': validApiKey,
        });

        const result = guard.canActivate(context);

        expect(result).toBe(true);
      });

      it('should throw UnauthorizedException when invalid API key in API-Key header', () => {
        const context = createMockExecutionContext({
          'api-key': 'invalid-key',
        });

        expect(() => guard.canActivate(context)).toThrow(
          new UnauthorizedException('Invalid API key'),
        );
      });
    });

    describe('Header priority', () => {
      it('should prioritize Authorization header over X-API-Key', () => {
        const context = createMockExecutionContext({
          authorization: `Bearer ${validApiKey}`,
          'x-api-key': 'different-key',
          'api-key': 'another-key',
        });

        const result = guard.canActivate(context);

        expect(result).toBe(true);
      });

      it('should prioritize X-API-Key over API-Key when no Authorization header', () => {
        const context = createMockExecutionContext({
          'x-api-key': validApiKey,
          'api-key': 'different-key',
        });

        const result = guard.canActivate(context);

        expect(result).toBe(true);
      });

      it('should use API-Key when no Authorization or X-API-Key headers', () => {
        const context = createMockExecutionContext({
          'api-key': validApiKey,
        });

        const result = guard.canActivate(context);

        expect(result).toBe(true);
      });
    });

    describe('Error cases', () => {
      it('should throw UnauthorizedException when no API key headers provided', () => {
        const context = createMockExecutionContext({});

        expect(() => guard.canActivate(context)).toThrow(
          new UnauthorizedException('API key is required'),
        );
      });

      it('should throw UnauthorizedException when headers exist but are empty', () => {
        const context = createMockExecutionContext({
          authorization: '',
          'x-api-key': '',
          'api-key': '',
        });

        expect(() => guard.canActivate(context)).toThrow(
          new UnauthorizedException('API key is required'),
        );
      });

      it('should throw UnauthorizedException when server API key not configured', () => {
        mockConfigService.get.mockReturnValue(undefined);
        const context = createMockExecutionContext({
          'x-api-key': 'some-key',
        });

        expect(() => guard.canActivate(context)).toThrow(
          new UnauthorizedException('API key not configured on server'),
        );
      });

      it('should throw UnauthorizedException when server API key is empty string', () => {
        mockConfigService.get.mockReturnValue('');
        const context = createMockExecutionContext({
          'x-api-key': 'some-key',
        });

        expect(() => guard.canActivate(context)).toThrow(
          new UnauthorizedException('API key not configured on server'),
        );
      });
    });

    describe('Case sensitivity', () => {
      it('should be case-sensitive for API key comparison', () => {
        const context = createMockExecutionContext({
          'x-api-key': validApiKey.toUpperCase(),
        });

        expect(() => guard.canActivate(context)).toThrow(
          new UnauthorizedException('Invalid API key'),
        );
      });

      it('should handle mixed case Bearer prefix', () => {
        const testCases = ['Bearer', 'BEARER', 'bearer', 'BeArEr'];

        testCases.forEach((prefix) => {
          const context = createMockExecutionContext({
            authorization: `${prefix} ${validApiKey}`,
          });

          if (prefix === 'Bearer') {
            expect(guard.canActivate(context)).toBe(true);
          } else {
            expect(() => guard.canActivate(context)).toThrow(
              new UnauthorizedException('API key is required'),
            );
          }
        });
      });
    });

    describe('Whitespace handling', () => {
      it('should handle extra whitespace in Authorization header', () => {
        const context = createMockExecutionContext({
          authorization: `Bearer    ${validApiKey}`,
        });

        expect(() => guard.canActivate(context)).toThrow(
          new UnauthorizedException('Invalid API key'),
        );
      });

      it('should handle API key with leading/trailing whitespace', () => {
        const context = createMockExecutionContext({
          'x-api-key': ` ${validApiKey} `,
        });

        expect(() => guard.canActivate(context)).toThrow(
          new UnauthorizedException('Invalid API key'),
        );
      });
    });
  });

  describe('extractApiKeyFromHeader', () => {
    it('should extract API key from Authorization header with Bearer prefix', () => {
      const request = {
        headers: {
          authorization: `Bearer ${validApiKey}`,
        },
      } as any;

      const result = guard['extractApiKeyFromHeader'](request);

      expect(result).toBe(validApiKey);
    });

    it('should extract API key from X-API-Key header', () => {
      const request = {
        headers: {
          'x-api-key': validApiKey,
        },
      } as any;

      const result = guard['extractApiKeyFromHeader'](request);

      expect(result).toBe(validApiKey);
    });

    it('should extract API key from API-Key header', () => {
      const request = {
        headers: {
          'api-key': validApiKey,
        },
      } as any;

      const result = guard['extractApiKeyFromHeader'](request);

      expect(result).toBe(validApiKey);
    });

    it('should return undefined when no recognized headers present', () => {
      const request = {
        headers: {
          'some-other-header': 'value',
        },
      } as any;

      const result = guard['extractApiKeyFromHeader'](request);

      expect(result).toBeUndefined();
    });

    it('should return undefined for malformed Authorization header', () => {
      const request = {
        headers: {
          authorization: 'NotBearer token',
        },
      } as any;

      const result = guard['extractApiKeyFromHeader'](request);

      expect(result).toBeUndefined();
    });
  });

  describe('Configuration', () => {
    it('should read API key from correct config path', () => {
      const context = createMockExecutionContext({
        'x-api-key': validApiKey,
      });

      guard.canActivate(context);

      expect(mockConfigService.get).toHaveBeenCalledWith('app.apiKey');
      expect(mockConfigService.get).toHaveBeenCalledTimes(1);
    });
  });
});
