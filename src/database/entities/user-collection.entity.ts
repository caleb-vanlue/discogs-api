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
@Index(['userId', 'dateAdded'])
@Index(['userId', 'rating'])
@Index(['userId', 'primaryArtist'])
@Index(['userId', 'title'])
@Index(['userId', 'year'])
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

  @Column({ nullable: true })
  title: string;

  @Column({ name: 'primary_artist', nullable: true })
  primaryArtist: string;

  @Column({ name: 'all_artists', nullable: true })
  allArtists: string;

  @Column({ nullable: true })
  year: number;

  @Column({ name: 'primary_genre', nullable: true })
  primaryGenre: string;

  @Column({ name: 'primary_format', nullable: true })
  primaryFormat: string;

  @Column({ name: 'vinyl_color', nullable: true })
  vinylColor: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Release, { eager: true })
  @JoinColumn({ name: 'release_id' })
  release: Release;
}
