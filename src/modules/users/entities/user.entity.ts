import { BeforeInsert, Column, Entity, OneToOne } from 'typeorm';
import { Expose } from 'class-transformer';

import { AbstractEntity } from '../../../database/abstract.entity';
import { Crypto } from '../../../common/crypto';
import { UserSettingsEntity } from './user-settings.entity';
import { RoleType } from '../../../constants';

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

  @OneToOne(
    () => UserSettingsEntity,
    (settings: UserSettingsEntity) => settings.user,
  )
  settings: UserSettingsEntity;

  @Expose()
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  @BeforeInsert()
  async hashPassword() {
    const crypto = new Crypto();
    this.password = crypto.generateHash(this.password);
  }
}
