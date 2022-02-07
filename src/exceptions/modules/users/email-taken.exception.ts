import { ConflictException } from '@nestjs/common';

export class EmailTakenException extends ConflictException {
  constructor(email: string) {
    super({ i18n: { key: 'exceptions.email_taken', args: { email } } });
  }
}
