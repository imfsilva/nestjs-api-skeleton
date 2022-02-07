import { NestFactory } from '@nestjs/core';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import helmet from 'helmet';
import * as compression from 'compression';
import { middleware as expressCtx } from 'express-ctx';

import { AppModule } from './app.module';
import { setupSwagger } from './setup-swagger';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';
import { ValidationPipe } from '@nestjs/common';
import { ApiConfigService } from './config/services/api-config.service';
import { ConfigModule } from './config/config.module';

async function bootstrap(): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),
    { cors: true },
  );

  app.use(compression());
  app.use(helmet());

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

  const configService: ApiConfigService = app
    .select(ConfigModule)
    .get(ApiConfigService);

  const port: string = configService.appConfig.port;
  await app.listen(port);

  const url: string = await app.getUrl();

  console.log(`Documentation: ${url}/docs`);
  console.log(`Application is running on: ${url}`);

  return app;
}

void bootstrap();
