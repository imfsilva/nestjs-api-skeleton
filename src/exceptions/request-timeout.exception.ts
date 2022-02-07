import { HttpException, HttpStatus } from '@nestjs/common';

import { HttpExceptionResponse } from '../filters/http-exception.filter';

export class RequestTimeoutException extends HttpException {
  constructor(response?: HttpExceptionResponse) {
    super(
      response ? response : { i18n: { key: 'exceptions.timeout' } },
      HttpStatus.REQUEST_TIMEOUT,
    );
  }
}
