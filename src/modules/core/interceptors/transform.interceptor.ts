import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { GeneratorProvider } from '../../../common/providers';
import { CommonUtilities } from '../../../common/utilities';

export interface ResponseDto<T> {
  requestId: string;
  statusCode: number;
  data?: T;
  errors?: string[];
  message?: string;
}

export function transformToResponseDto<T>(payload: {
  statusCode: number;
  data?: T;
  message?: string | string[];
}): ResponseDto<T> {
  const { statusCode, data, message } = payload;

  const response: ResponseDto<T> = {
    requestId: GeneratorProvider.uuid(),
    statusCode,
  };

  if (data) {
    if (typeof data === 'string') response.message = data;
    else response.data = data;
  }

  if (typeof message === 'string') response.message = message;
  else if (Array.isArray(message))
    response.errors = message.map((error: string) => CommonUtilities.capitalize(error)); // errors from validation pipe

  return response;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ResponseDto<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseDto<T>> {
    const statusCode: number = context.switchToHttp().getResponse().statusCode;

    return next.handle().pipe(map((data: any) => transformToResponseDto({ statusCode, data })));
  }
}
