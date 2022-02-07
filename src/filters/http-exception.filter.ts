import { I18nService } from 'nestjs-i18n';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

import { transformToResponseDto } from '../interceptors/transform.interceptor';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

export interface HttpI18nMessage {
  i18n?: { key: string; args?: Record<string, any> };
  message?: string | string[];
}

@Catch(HttpException)
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly i18n: I18nService) {}

  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx: HttpArgumentsHost = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const statusCode: number = exception.getStatus();

    const exceptionData: HttpI18nMessage =
      exception.getResponse() as HttpI18nMessage;

    const { i18n, message } = exceptionData;

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
    return response
      .status(statusCode)
      .json(transformToResponseDto({ statusCode, message }));
  }
}
