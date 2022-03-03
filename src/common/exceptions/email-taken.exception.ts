import { HttpException, HttpStatus } from '@nestjs/common';

export class EmailTakenException extends HttpException {
  constructor(email: string) {
    super({ i18n: { key: 'exceptions.email_taken', args: { email } } }, HttpStatus.CONFLICT);
  }
}
