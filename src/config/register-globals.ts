import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as compression from 'compression';
import { middleware as expressCtx } from 'express-ctx';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { TimeoutInterceptor } from '../modules/core/interceptors';
import { swagger } from './swagger';

export function registerGlobals(app: INestApplication) {
  app.use(compression());

  // swagger config
  swagger(app);

  // interceptors
  app.useGlobalInterceptors(new TimeoutInterceptor());

  // pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // global middlewares
  app.use(expressCtx);

  // implement winston logger
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
}
