import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { MulterModuleOptions } from '@nestjs/platform-express';

import { Languages, MAX_FILE_SIZE_IN_BYTES } from '../../../common/constants';
import connectionOptions from '../../../database/ormconfig';

@Injectable()
export class ConfigService {
  constructor(private nestConfigService: NestConfigService) {}

  private get(key: string): string {
    const value = this.nestConfigService.get<string>(key);

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
    return Languages.en;
  }

  get typeormConfig(): TypeOrmModuleOptions {
    return connectionOptions;
  }

  get authConfig() {
    return {
      atSecret: this.getString('AT_SECRET'),
      atExpiration: this.getString('AT_EXPIRATION_TIME'),
      rtSecret: this.getString('RT_SECRET'),
      rtExpiration: this.getString('RT_EXPIRATION_TIME'),
    };
  }

  get multerConfig(): MulterModuleOptions {
    return {
      limits: { fileSize: MAX_FILE_SIZE_IN_BYTES },
    };
  }

  get throttleConfig() {
    return {
      ttl: this.getNumber('THROTTLE_TTL'),
      limit: this.getNumber('THROTTLE_LIMIT'),
    };
  }

  get mailerConfig() {
    return {
      host: this.getString('MAILER_HOST'),
      port: this.getNumber('MAILER_PORT'),
      secure: this.getBoolean('MAILER_SECURE'),
      authUser: this.getString('MAILER_USER'),
      authPass: this.getString('MAILER_PASSWORD'),
      outgoingEmail: this.getString('MAILER_OUTGOING_EMAIL'),
    };
  }

  get S3Config() {
    return {
      url: this.getString('S3_URL'),
      publicUrl: this.getString('S3_PUBLIC_URL'),
      bucketName: this.getString('S3_BUCKET_NAME'),
      accessKey: this.getString('S3_ACCESS_KEY'),
      secretKey: this.getString('S3_SECRET_KEY'),
      region: this.getString('S3_REGION'),
    };
  }

  get appConfig() {
    return {
      port: this.getString('PORT'),
    };
  }
}
