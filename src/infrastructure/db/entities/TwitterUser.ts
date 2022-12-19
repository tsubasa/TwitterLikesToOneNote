import { PrimaryColumn, Column, Entity, Index, CreateDateColumn } from 'typeorm';

@Entity()
export default class TwitterUser {
  @PrimaryColumn({ name: 'id', type: 'varchar', length: 64, nullable: false })
  id!: string;

  @Index()
  @Column({ name: 'user_name', type: 'varchar', length: 64, nullable: false })
  username!: string;

  @Index()
  @Column({ name: 'name', type: 'varchar', length: 128, nullable: false })
  name!: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt?: string;
}
