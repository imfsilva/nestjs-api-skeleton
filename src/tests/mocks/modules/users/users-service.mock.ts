import { UserEntity } from '../../../../modules/users/entities/user.entity';

const user = new UserEntity();

export const UsersServiceMock = {
  totalRepositoryItems: jest.fn().mockReturnValue(0),
  findAll: jest.fn().mockReturnValue([user]),
  findOne: jest.fn().mockReturnValue(user),
  update: jest.fn().mockReturnValue(user),
  updateWithGuard: jest.fn().mockReturnValue(user),
  createImage: jest.fn(),
  deleteImage: jest.fn(),
  changePassword: jest.fn(),
  remove: jest.fn(),
};
