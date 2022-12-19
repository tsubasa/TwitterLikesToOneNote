import { PrimaryColumn, Column, Entity, Index, CreateDateColumn } from 'typeorm';

@Entity()
export default class TwitterTweet {
  @PrimaryColumn({ name: 'id', type: 'varchar', length: 64, nullable: false })
  id!: string;

  @Index()
  @Column({ name: 'user_id', type: 'varchar', length: 64, nullable: false })
  userId!: string;

  @Column({ name: 'text', type: 'text', nullable: false })
  text!: string;

  @CreateDateColumn({ name: 'tweeted_at', type: 'datetime', nullable: false })
  tweetedAt?: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt?: string;
}
