import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = this.extractApiKeyFromHeader(request);

    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    const validApiKey = this.configService.get<string>('app.apiKey');

    if (!validApiKey) {
      throw new UnauthorizedException('API key not configured on server');
    }

    if (apiKey !== validApiKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }

  private extractApiKeyFromHeader(request: Request): string | undefined {
    // 1. Authorization: Bearer <token>
    // 2. X-API-Key: <token>
    // 3. API-Key: <token>

    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    const xApiKey = request.headers['x-api-key'] as string;
    if (xApiKey) {
      return xApiKey;
    }

    const apiKey = request.headers['api-key'] as string;
    if (apiKey) {
      return apiKey;
    }

    return undefined;
  }
}
