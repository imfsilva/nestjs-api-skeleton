import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { NestMinioModule } from 'nestjs-minio';
import * as path from 'path';
import {
  AcceptLanguageResolver,
  I18nJsonParser,
  I18nModule,
} from 'nestjs-i18n';

import { AllExceptionsFilter } from './common/filters';
import { ConfigService } from './modules/shared/services/config.service';
import { AtGuard } from './modules/auth/guards';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CoreModule } from './modules/core/core.module';
import { SharedModule } from './modules/shared/shared.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    WinstonModule.forRoot({
      transports: [
        new winston.transports.File({
          dirname: path.join(__dirname, '..', 'logs'),
          filename: 'errors.log',
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
          ),
        }),
      ],
    }),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '/public'),
    }),
    ThrottlerModule.forRootAsync({
      imports: [SharedModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ttl: config.throttleConfig.ttl,
        limit: config.throttleConfig.limit,
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [SharedModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.typeormConfig,
    }),
    NestMinioModule.registerAsync({
      imports: [SharedModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        endPoint: config.S3Config.url,
        ...(config.isProduction ? null : { port: 9000 }),
        useSSL: config.isProduction,
        accessKey: config.S3Config.accessKey,
        secretKey: config.S3Config.secretKey,
      }),
    }),
    MailerModule.forRootAsync({
      imports: [SharedModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.mailerConfig.host,
          port: config.mailerConfig.port,
          secure: config.mailerConfig.secure,
          auth: {
            user: config.mailerConfig.authUser,
            pass: config.mailerConfig.authPass,
          },
        },
        defaults: {
          from: config.mailerConfig.outgoingEmail,
        },
        template: {
          dir: path.join(__dirname, '/templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    I18nModule.forRootAsync({
      imports: [SharedModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.fallbackLanguage,
        parserOptions: {
          path: path.join(__dirname, '/i18n'),
          watch: configService.isDevelopment,
        },
      }),
      parser: I18nJsonParser,
      resolvers: [
        {
          use: AcceptLanguageResolver,
          options: { matchType: 'strict-loose' },
        },
      ],
    }),
    CoreModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
  ],
})
export class AppModule {}
