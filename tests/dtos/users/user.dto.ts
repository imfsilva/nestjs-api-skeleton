import { testImageDto } from './image.dto';
import { testSettingsDto } from './settings.dto';
import { UserDto } from '../../../src/modules/users/dtos';

export const testUserDto = (user: UserDto) => {
  expect(user.id).toBeTruthy();
  expect(user.firstName).toBeTruthy();
  expect(user.lastName).toBeTruthy();
  expect(user.email).toBeTruthy();
  expect(user.role).toBeTruthy();
  expect(typeof user.softDelete === 'boolean').toBeTruthy();
  testImageDto(user.image);
  testSettingsDto(user.settings);
};
