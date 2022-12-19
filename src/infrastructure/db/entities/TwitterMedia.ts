import { PrimaryColumn, Column, Entity, Index, CreateDateColumn } from 'typeorm';

@Entity()
export default class TwitterMedia {
  @PrimaryColumn({ name: 'id', type: 'varchar', length: 64, nullable: false })
  id!: string;

  @Index()
  @Column({ name: 'tweet_id', type: 'varchar', length: 64, nullable: false })
  tweetId!: string;

  @Index()
  @Column({ name: 'type', type: 'varchar', length: 16, nullable: false })
  type!: string;

  @Column({ name: 'url', type: 'text', nullable: false })
  url!: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt?: string;
}
