/* eslint-disable @nx/enforce-module-boundaries */
import { DataSource, DataSourceOptions } from "typeorm";
import { config } from "dotenv";
import { ConfigService } from "@nestjs/config";

config();

const configService = new ConfigService();

export const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',
    host: configService.getOrThrow('DB_HOST'),
    port: parseInt(configService.getOrThrow('DB_PORT') as string),
    username: configService.getOrThrow('DB_USER'),
    password: configService.getOrThrow('DB_PASSWORD'),
    database: configService.getOrThrow('DB_NAME'),
    entities: [],
    synchronize: false,
    migrations: ['apps/ride-spark/src/migrations/*.ts'],
}

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;