import { define } from 'typeorm-seeding';

import { RoleType } from '../../common/constants';
import { UserEntity } from '../../modules/users/entities/user.entity';

define(UserEntity, (faker) => {
  const gender = faker.random.number(1);
  const firstName = faker.name.firstName(gender);
  const lastName = faker.name.lastName(gender);

  const user = new UserEntity();
  user.firstName = firstName;
  user.lastName = lastName;
  user.email = 'admin@skeleton.com';
  user.role = RoleType.ADMIN;
  user.password = 'super-secret-password';

  return user;
});
