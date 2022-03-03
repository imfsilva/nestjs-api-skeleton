import { NestFactory } from '@nestjs/core';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';
import { ConfigService } from './modules/shared/services/config.service';
import { SharedModule } from './modules/shared/shared.module';
import { S3Service } from './modules/shared/services/s3.service';
import { registerGlobals } from './config/register-globals';

async function bootstrap(): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, new ExpressAdapter(), {
    cors: true,
  });

  registerGlobals(app);

  const s3Service: S3Service = app.select(SharedModule).get(S3Service);
  await s3Service.createBucketIfNotExist();

  const configService: ConfigService = app.select(SharedModule).get(ConfigService);
  const port: string = configService.appConfig.port;
  await app.listen(port);

  const url: string = await app.getUrl();

  console.log(`Documentation: ${url}/docs`);
  console.log(`Application is running on: ${url}`);

  return app;
}

void bootstrap();
