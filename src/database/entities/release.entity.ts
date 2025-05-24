import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('releases')
@Index(['primaryArtist'])
@Index(['year'])
@Index(['title'])
export class Release {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'discogs_id', unique: true })
  @Index()
  discogsId: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  year: number;

  @Column({ name: 'primary_artist', nullable: true })
  primaryArtist: string;

  @Column({ name: 'all_artists', nullable: true })
  allArtists: string;

  @Column({ name: 'primary_genre', nullable: true })
  primaryGenre: string;

  @Column({ name: 'primary_style', nullable: true })
  primaryStyle: string;

  @Column({ name: 'primary_format', nullable: true })
  primaryFormat: string;

  @Column({ name: 'vinyl_color', nullable: true })
  vinylColor: string;

  @Column({ name: 'catalog_number', nullable: true })
  catalogNumber: string;

  @Column({ name: 'record_label', nullable: true })
  recordLabel: string;

  @Column({ name: 'thumb_url', nullable: true })
  thumbUrl: string;

  @Column({ name: 'cover_image_url', nullable: true })
  coverImageUrl: string;

  @Column('json')
  artists: Array<{
    name: string;
    anv: string;
  }>;

  @Column('json', { nullable: true })
  labels: Array<{
    name: string;
    catno: string;
  }>;

  @Column('json', { nullable: true })
  formats: Array<{
    name: string;
    qty: string;
    descriptions: string[];
    text?: string;
  }>;

  @Column('json', { nullable: true })
  genres: string[];

  @Column('json', { nullable: true })
  styles: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
