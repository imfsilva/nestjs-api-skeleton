import { BeforeInsert, Column, Entity, OneToOne } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { UserSettingsEntity } from './user-settings.entity';
import { RoleType } from '../../../common/constants';
import { Crypto } from '../../../common/utilities';
import { UserImageEntity } from './user-image.entity';

@Entity({ name: 'users' })
export class UserEntity extends AbstractEntity {
  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ type: 'enum', enum: RoleType, default: RoleType.USER })
  role: RoleType;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true, type: 'varchar' })
  recoverPasswordToken: string | null;

  @Column({ nullable: true, type: 'bigint' })
  recoverPasswordExpiration: number | null;

  @Column({ default: null, type: 'varchar' })
  hashedRt: string | null;

  @OneToOne(() => UserSettingsEntity, (settings: UserSettingsEntity) => settings.user)
  settings: UserSettingsEntity;

  @OneToOne(() => UserImageEntity, (image: UserImageEntity) => image.user, {
    nullable: true,
  })
  image: UserImageEntity | null;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  @BeforeInsert()
  async hashPassword() {
    this.password = new Crypto().generateHash(this.password);
  }
}
