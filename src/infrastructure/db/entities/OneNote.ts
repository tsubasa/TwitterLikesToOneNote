import { Column, Entity, PrimaryGeneratedColumn, Index, CreateDateColumn } from 'typeorm';

@Entity()
export default class OneNote {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ name: 'tweet_id', type: 'varchar', length: 64, nullable: false })
  tweetId!: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt?: string;
}
