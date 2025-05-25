import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DiscogsConfig {
  constructor(private configService: ConfigService) {}

  get username(): string {
    const username = this.configService.get<string>('app.discogs.username');
    if (!username) {
      throw new Error('DISCOGS_USERNAME environment variable is required');
    }
    return username;
  }

  get apiToken(): string | undefined {
    return this.configService.get<string>('app.discogs.apiToken');
  }

  get baseUrl(): string {
    return this.configService.get<string>(
      'app.discogs.baseUrl',
      'https://api.discogs.com',
    );
  }

  get hasApiToken(): boolean {
    return !!this.apiToken;
  }
}
