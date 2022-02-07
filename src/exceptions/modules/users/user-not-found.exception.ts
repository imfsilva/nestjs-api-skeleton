import { NotFoundException } from '../../not-found.exception';

export class UserNotFoundException extends NotFoundException {
  constructor(uuid: string) {
    super({ i18n: { key: 'exceptions.user_not_found', args: { uuid } } });
  }
}
