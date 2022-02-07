import { NestFactory } from '@nestjs/core';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import helmet from 'helmet';
import * as compression from 'compression';

import { AppModule } from './app.module';
import { SharedModule } from './shared/shared.module';
import { ApiConfigService } from './shared/services/api-config.service';
import { setupSwagger } from './setup-swagger';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';
import { ValidationPipe } from '@nestjs/common';

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

  const configService: ApiConfigService = app
    .select(SharedModule)
    .get(ApiConfigService);

  const port: string = configService.appConfig.port;
  await app.listen(port);

  const url: string = await app.getUrl();

  console.log(`Documentation: ${url}/docs`);
  console.log(`Application is running on: ${url}`);

  return app;
}

void bootstrap();
