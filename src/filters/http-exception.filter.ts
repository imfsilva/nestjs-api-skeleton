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

export interface HttpExceptionResponse {
  error?: any;
  message?: string;
  i18n?: { key: string; args?: Record<string, any> };
}

@Catch(HttpException)
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly i18n: I18nService) {}

  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx: HttpArgumentsHost = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const code: number = exception.getStatus();

    const exceptionResponse: HttpExceptionResponse =
      exception.getResponse() as HttpExceptionResponse;

    const { message, error, i18n } = exceptionResponse;

    // nestjs default http exceptions
    if (!i18n && error && message) {
      return response
        .status(code)
        .json(transformToResponseDto({ code, message, error }));
    }

    // translate message if i18n property is present on exceptionResponse variable
    const translatedMessage: string = await this.i18n.translate(i18n.key, {
      lang: ctx.getRequest().i18nLang,
      args: i18n.args,
    });

    return response
      .status(code)
      .json(
        transformToResponseDto({ code, message: translatedMessage, error }),
      );
  }
}
