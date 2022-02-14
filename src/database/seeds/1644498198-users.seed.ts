import type { Factory, Seeder } from 'typeorm-seeding';

import { UserSettingsEntity } from '../../modules/users/entities/user-settings.entity';
import { UserEntity } from '../../modules/users/entities/user.entity';

export default class CreateUsers implements Seeder {
  public async run(factory: Factory): Promise<void> {
    const AMOUNT = 10;

    for (let i = 0; i < AMOUNT; i++) {
      const user: UserEntity = await factory(UserEntity)().create();
      await factory(UserSettingsEntity)().create({ user, userId: user.id });
    }
  }
}
