import { HttpException, HttpStatus } from '@nestjs/common';

import { HttpI18nMessage } from '../filters';

export class BadRequestException extends HttpException {
  constructor(message?: HttpI18nMessage) {
    super(
      message ? message : { i18n: { key: 'exceptions.bad_request' } },
      HttpStatus.BAD_REQUEST,
    );
  }
}
