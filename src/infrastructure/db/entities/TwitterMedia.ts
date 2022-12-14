import { PrimaryColumn, Column, Entity, Index, CreateDateColumn } from 'typeorm';

@Entity()
export default class TwitterMedia {
  @PrimaryColumn({ name: 'media_id', type: 'varchar', length: 64, nullable: false })
  mediaId!: string;

  @Index()
  @Column({ name: 'tweet_id', type: 'varchar', length: 64, nullable: false })
  tweetId!: string;

  @Column({ name: 'media_url', type: 'text', nullable: false })
  content!: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt?: string;
}
