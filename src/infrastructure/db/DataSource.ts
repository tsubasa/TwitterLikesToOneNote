import { DataSource } from 'typeorm';
import TwitterTweet from './entities/TwitterTweet';
import TwitterUser from './entities/TwitterUser';
import TwitterMedia from './entities/TwitterMedia';
import OneNote from './entities/OneNote';

export default new DataSource({
  type: 'sqlite',
  database: 'database.db',
  synchronize: true,
  logging: false,
  entities: [TwitterTweet, TwitterUser, TwitterMedia, OneNote],
  migrations: ['src/infrastructure/db/migrations/*.ts'],
});
