import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { UserEntity } from './user.entity';
import { S3Service } from '../../shared/services/s3.service';

@Entity({ name: 'users_images' })
export class UserImageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  extension: string;

  @Column({ type: 'uuid' })
  userId: string;

  @OneToOne(() => UserEntity, (user: UserEntity) => user.image, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  get url() {
    return S3Service.getUrlPath({
      module: 'users',
      proprietaryId: this.userId,
      fileId: this.id,
      fileExtension: this.extension,
    });
  }
}
