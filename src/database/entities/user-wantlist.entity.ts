import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Release } from './release.entity';

@Entity('user_wantlists')
@Index(['userId', 'releaseId'], { unique: true })
export class UserWantlist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ name: 'release_id' })
  releaseId: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'date_added', type: 'timestamp', nullable: true })
  dateAdded: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Release, { eager: true })
  @JoinColumn({ name: 'release_id' })
  release: Release;
}
