import { Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ClassConstructor, plainToInstance } from 'class-transformer';

export abstract class AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: false })
  softDelete: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  transform<T, K>(dto: ClassConstructor<T>, plain: K) {
    return plainToInstance(dto, plain);
  }
}
