import { UserEntity } from '../modules/users/entities/user.entity';

export const ContextProviderMock = {
  set: jest.fn().mockReturnThis(),
  get: jest.fn().mockReturnThis(),
  getKeyWithNamespace: jest.fn().mockReturnValue('key'),
  setAuthUser: jest.fn(),
  getAuthUser: jest.fn().mockReturnValue(new UserEntity()),
};
