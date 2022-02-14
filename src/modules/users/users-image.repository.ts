import { EntityRepository, Repository } from 'typeorm';

import { UserImageEntity } from './entities/user-image.entity';

@EntityRepository(UserImageEntity)
export class UsersImageRepository extends Repository<UserImageEntity> {}
