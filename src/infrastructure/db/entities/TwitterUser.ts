import { PrimaryColumn, Column, Entity, Index, CreateDateColumn } from 'typeorm';

@Entity()
export default class TwitterUser {
  @PrimaryColumn({ name: 'user_id', type: 'varchar', length: 64, nullable: false })
  userId!: string;

  @Index()
  @Column({ name: 'screen_name', type: 'varchar', length: 64, nullable: false })
  screenName!: string;

  @Index()
  @Column({ name: 'display_name', type: 'varchar', length: 128, nullable: false })
  displayName!: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt?: string;
}
