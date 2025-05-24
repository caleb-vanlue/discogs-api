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

@Entity('user_collections')
@Index(['userId', 'releaseId'], { unique: true })
export class UserCollection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ name: 'release_id' })
  releaseId: number;

  @Column({ name: 'discogs_instance_id', nullable: true })
  discogsInstanceId: number;

  @Column({ name: 'folder_id', default: 0 })
  folderId: number;

  @Column({ type: 'smallint', default: 0 })
  rating: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'json', nullable: true })
  customFields: Record<string, any>;

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
