import { HttpException, HttpStatus } from '@nestjs/common';

import { HttpI18nMessage } from '../filters';

export class NotFoundException extends HttpException {
  constructor(message?: HttpI18nMessage) {
    super(
      message ? message : { i18n: { key: 'exceptions.not_found' } },
      HttpStatus.NOT_FOUND,
    );
  }
}
