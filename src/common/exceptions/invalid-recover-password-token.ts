import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidRecoverPasswordToken extends HttpException {
  constructor() {
    super('Invalid or expired recover password token', HttpStatus.UNAUTHORIZED);
  }
}
