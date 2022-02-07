import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { SnakeNamingStrategy } from '../../database/snake-naming.strategy';

@Injectable()
export class ApiConfigService {
  constructor(private configService: ConfigService) {}

  private get(key: string): string {
    const value = this.configService.get<string>(key);

    if (value === null || value === undefined) {
      throw new Error(key + ' environment variable does not set');
    }

    return value;
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isStaging(): boolean {
    return this.nodeEnv === 'staging';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }

  private getNumber(key: string): number {
    const value = this.get(key);

    try {
      return Number(value);
    } catch {
      throw new Error(key + ' environment variable is not a number');
    }
  }

  private getBoolean(key: string): boolean {
    const value = this.get(key);

    try {
      return Boolean(JSON.parse(value));
    } catch {
      throw new Error(key + ' environment variable is not a boolean');
    }
  }

  private getString(key: string): string {
    const value = this.get(key);

    return value.replace(/\\n/g, '\n');
  }

  get nodeEnv(): string {
    return this.getString('NODE_ENV');
  }

  get fallbackLanguage(): string {
    return this.getString('FALLBACK_LANGUAGE').toLowerCase();
  }

  get typeormConfig(): TypeOrmModuleOptions {
    const entities: string[] = [
      __dirname + '/../../modules/**/*.entity{.ts,.js}',
    ];

    const migrations: string[] = [
      __dirname + '/../../database/migrations/*{.ts,.js}',
    ];

    return {
      entities,
      migrations,
      keepConnectionAlive: !this.isTest,
      dropSchema: this.isTest,
      synchronize: this.isDevelopment,
      type: 'postgres',
      name: 'default',
      url: this.getString('DB_URL'),
      migrationsRun: true,
      logging: this.getBoolean('ENABLE_ORM_LOGS'),
      namingStrategy: new SnakeNamingStrategy(),
    };
  }

  get authConfig() {
    return {
      jwtSecret: this.getString('JWT_SECRET_KEY'),
      jwtExpirationTime: this.getString('JWT_EXPIRATION_TIME'),
    };
  }

  get throttleConfig() {
    return {
      ttl: this.getNumber('THROTTLE_TTL'),
      limit: this.getNumber('THROTTLE_LIMIT'),
    };
  }

  get cryptoSecret() {
    return {
      cryptoSecret: this.getString('JWT_SECRET_KEY'),
    };
  }

  get appConfig() {
    return {
      port: this.getString('PORT'),
    };
  }
}
