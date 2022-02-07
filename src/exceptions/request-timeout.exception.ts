import { HttpException, HttpStatus } from '@nestjs/common';

export class RequestTimeoutException extends HttpException {
  constructor() {
    super({ i18n: { key: 'exceptions.timeout' } }, HttpStatus.REQUEST_TIMEOUT);
  }
}
