import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

import { SnakeNamingStrategy } from './snake-naming.strategy';

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const environment = process.env.NODE_ENV;

const connectionOptions: TypeOrmModuleOptions & {
  seeds: string[];
  factories: string[];
} = {
  entities: [__dirname + '/../modules/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  seeds: [__dirname + '/seeds/*{.js}'],
  factories: [__dirname + '/factories/*{.js}'],
  dropSchema: environment === 'test',
  synchronize: environment === 'development',
  keepConnectionAlive: true,
  type: 'postgres',
  name: 'default',
  url: process.env.DB_URL,
  migrationsRun: true,
  migrationsTableName: 'migrations',
  logging: Boolean(JSON.parse(process.env.ENABLE_ORM_LOGS)),
  namingStrategy: new SnakeNamingStrategy(),
  cli: { migrationsDir: path.join(__dirname + '/migrations') },
};

export default connectionOptions;
