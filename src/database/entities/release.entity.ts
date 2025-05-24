import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('releases')
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
