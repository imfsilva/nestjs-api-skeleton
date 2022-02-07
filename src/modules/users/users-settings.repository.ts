import { EntityRepository, Repository } from 'typeorm';

import { UserSettingsEntity } from './entities/user-settings.entity';

@EntityRepository(UserSettingsEntity)
export class UsersSettingsRepository extends Repository<UserSettingsEntity> {}
