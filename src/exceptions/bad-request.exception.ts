import { HttpException, HttpStatus } from '@nestjs/common';

import { HttpExceptionResponse } from '../filters/http-exception.filter';

export class BadRequestException extends HttpException {
  constructor(response?: HttpExceptionResponse) {
    super(
      response ? response : { i18n: { key: 'exceptions.bad_request' } },
      HttpStatus.BAD_REQUEST,
    );
  }
}
