import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV?: Environment = Environment.Development;

  @IsNumber()
  @IsOptional()
  PORT?: number = 3000;

  @IsString()
  API_KEY: string;

  @IsString()
  @IsOptional()
  DB_HOST?: string = 'localhost';

  @IsNumber()
  @IsOptional()
  DB_PORT?: number = 5432;

  @IsString()
  @IsOptional()
  DB_USERNAME?: string = 'postgres';

  @IsString()
  @IsOptional()
  DB_PASSWORD?: string = 'password';

  @IsString()
  @IsOptional()
  DB_NAME?: string = 'discogs';

  @IsString()
  DISCOGS_USERNAME: string;

  @IsString()
  @IsOptional()
  DISCOGS_API_TOKEN?: string;

  @IsString()
  @IsOptional()
  DISCOGS_API_BASE_URL?: string = 'https://api.discogs.com';
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Configuration validation error: ${errors.toString()}`);
  }

  return validatedConfig;
}
