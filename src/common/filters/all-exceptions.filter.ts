import {
  ArgumentsHost,
  ExceptionFilter,
  Catch,
  HttpException,
  HttpStatus,
  Inject,
  Logger,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { Response } from 'express';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

import { transformToResponseDto } from '../../modules/core/interceptors';

export interface HttpI18nMessage {
  i18n?: { key: string; args?: Record<string, any> };
  message?: string | string[];
  response?: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async catch(exception: any, host: ArgumentsHost) {
    const ctx: HttpArgumentsHost = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // http exceptions
    if (exception instanceof HttpException) {
      const statusCode: number = exception.getStatus();
      const exceptionData: HttpI18nMessage = exception.getResponse() as HttpI18nMessage;

      const { i18n, message } = exceptionData;

      if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error(exceptionData);
      }

      if (i18n) {
        // translate message if i18n property is present on exceptionData
        const translatedMessage: string = await this.i18n.translate(i18n.key, {
          lang: ctx.getRequest().i18nLang,
          args: i18n.args,
        });

        return response.status(statusCode).json(
          transformToResponseDto({
            statusCode,
            message: translatedMessage,
          }),
        );
      }

      // untranslated exceptions
      return response.status(statusCode).json(
        transformToResponseDto({
          statusCode,
          message: message || String(exceptionData),
        }),
      );
    }

    // serve static exception
    if (exception.code === 'ENOENT') {
      return response.status(HttpStatus.BAD_REQUEST).json(
        transformToResponseDto({
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Route not found (Method: ${request.method} | URL: ${request.url})`,
        }),
      );
    }

    // default
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      transformToResponseDto({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      }),
    );
  }
}
