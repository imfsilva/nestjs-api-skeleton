import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

import { PaginationResponseDto } from '../common/utilities/pagination/dtos/pagination-response.dto';

export const BEARER_AUTH_NAME = 'JWT';

export function swagger(app: INestApplication): void {
  const documentBuilder = new DocumentBuilder().setTitle('API').addBearerAuth(
    {
      name: 'Authorization',
      bearerFormat: 'Bearer',
      scheme: 'Bearer',
      type: 'http',
      in: 'Header',
    },
    BEARER_AUTH_NAME,
  );

  if (process.env.API_VERSION) documentBuilder.setVersion(process.env.API_VERSION);

  const document: OpenAPIObject = SwaggerModule.createDocument(app, documentBuilder.build(), {
    extraModels: [PaginationResponseDto],
  });
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
}
