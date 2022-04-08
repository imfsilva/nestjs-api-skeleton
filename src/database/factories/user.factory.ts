import { define } from 'typeorm-seeding';

import { RoleType } from '../../common/constants';
import { UserEntity } from '../../modules/users/entities/user.entity';

define(UserEntity, () => {
  const user = new UserEntity();
  user.firstName = 'Admin';
  user.lastName = 'Admin';
  user.email = 'admin@skeleton.com';
  user.role = RoleType.ADMIN;
  user.password = 'super-secret-password';

  return user;
});
