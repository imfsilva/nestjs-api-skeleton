import { NestFactory } from '@nestjs/core';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import * as compression from 'compression';
import { middleware as expressCtx } from 'express-ctx';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { AppModule } from './app.module';
import { TimeoutInterceptor } from './modules/core/interceptors';
import { setupSwagger } from './config/setup-swagger';
import { ConfigService } from './modules/shared/services/config.service';
import { SharedModule } from './modules/shared/shared.module';
import { S3Service } from './modules/shared/services/s3.service';

async function bootstrap(): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),
    { cors: true },
  );

  const configService: ConfigService = app
    .select(SharedModule)
    .get(ConfigService);

  app.use(compression());

  // swagger config
  setupSwagger(app);

  // interceptors
  app.useGlobalInterceptors(new TimeoutInterceptor());

  // pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      skipUndefinedProperties: true,
    }),
  );

  // global middlewares
  app.use(expressCtx);

  // implement winston logger
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  const s3Service: S3Service = app.select(SharedModule).get(S3Service);
  await s3Service.createBucketIfNotExist();

  const port: string = configService.appConfig.port;
  await app.listen(port);

  const url: string = await app.getUrl();

  console.log(`Documentation: ${url}/docs`);
  console.log(`Application is running on: ${url}`);

  return app;
}

void bootstrap();
