import { getValue, setValue } from 'express-ctx';

import { UserEntity } from '../../../modules/users/entities/user.entity';

export class ContextProvider {
  private static readonly namespace = 'request';
  private static readonly authUserKey = 'user';
  private static readonly appUrl = 'appUrl';

  private static set(key: string, value: any): void {
    setValue(ContextProvider.getKeyWithNamespace(key), value);
  }

  private static get<T>(key: string): T | undefined {
    return getValue<T>(ContextProvider.getKeyWithNamespace(key));
  }

  private static getKeyWithNamespace(key: string): string {
    return `${ContextProvider.namespace}.${key}`;
  }

  public setAuthUser(user: UserEntity): void {
    ContextProvider.set(ContextProvider.authUserKey, user);
  }

  public getAuthUser(): UserEntity | undefined {
    return ContextProvider.get<UserEntity>(ContextProvider.authUserKey);
  }
}
