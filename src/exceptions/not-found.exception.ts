import { HttpException, HttpStatus } from '@nestjs/common';

import { HttpExceptionResponse } from '../filters/http-exception.filter';

export class NotFoundException extends HttpException {
  constructor(response?: HttpExceptionResponse) {
    super(
      response ? response : { i18n: { key: 'exceptions.not_found' } },
      HttpStatus.NOT_FOUND,
    );
  }
}
