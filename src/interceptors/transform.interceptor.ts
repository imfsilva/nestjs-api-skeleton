import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { uuid } from '../common/utils';

export interface ResponseDto<T> {
  requestId: string;
  code: number;
  data?: T;
  error?: T;
  message?: string;
}

export function transformToResponseDto<T>(payload: {
  code: number;
  data?: T;
  error?: T;
  message?: string;
}): ResponseDto<T> {
  const { code, data, error, message } = payload;

  const response: ResponseDto<T> = { requestId: uuid(), code };

  if (data) {
    if (typeof data === 'string') response.message = data;
    else response.data = data;
  }
  if (message) response.message = message;
  if (error && !message) response.error = error;

  return response;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ResponseDto<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseDto<T>> {
    const code: number = context.switchToHttp().getResponse().statusCode;

    return next
      .handle()
      .pipe(map((data: any) => transformToResponseDto({ code, data })));
  }
}
