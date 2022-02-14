import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotFoundException extends HttpException {
  constructor(message?: string) {
    super(message || 'User not found', HttpStatus.NOT_FOUND);
  }
}
