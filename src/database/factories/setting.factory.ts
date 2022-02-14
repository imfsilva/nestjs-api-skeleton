import { define } from 'typeorm-seeding';

import { Languages } from '../../common/constants';
import { UserSettingsEntity } from '../../modules/users/entities/user-settings.entity';

define(UserSettingsEntity, () => {
  const settings = new UserSettingsEntity();
  settings.language = Languages.en;

  return settings;
});
