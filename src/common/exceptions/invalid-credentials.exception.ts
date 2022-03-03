import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidCredentialsException extends HttpException {
  constructor() {
    super({ i18n: { key: 'exceptions.invalid_credentials' } }, HttpStatus.UNAUTHORIZED);
  }
}
