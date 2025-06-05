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

@Entity('user_suggestions')
@Index(['userId', 'releaseId'], { unique: true })
@Index(['userId', 'dateAdded'])
@Index(['userId', 'primaryArtist'])
@Index(['userId', 'title'])
@Index(['userId', 'year'])
export class UserSuggestion {
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
