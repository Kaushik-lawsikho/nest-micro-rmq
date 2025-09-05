import { DataSource } from 'typeorm';
import { config as loadEnv } from 'dotenv';
import { User } from './src/entities/user.entity';
import { Activity } from './src/entities/activity.entity';
import { Tag } from './src/entities/tag.entity';

loadEnv();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  database: process.env.DB_NAME || 'analytics',
  entities: [User, Activity, Tag],
  migrations: ['src/migrations/*.ts'],
});


