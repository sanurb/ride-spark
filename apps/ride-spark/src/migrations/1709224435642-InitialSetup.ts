import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSetup1709224435642 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE EXTENSION IF NOT EXISTS postgis;
            
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255),
                email VARCHAR(255) UNIQUE,
                password VARCHAR(255),
                type VARCHAR(255) NOT NULL DEFAULT 'rider',
                location GEOMETRY(Point, 4326),
                last_location_update TIMESTAMP
            );
        `);

        await queryRunner.query(`
            INSERT INTO users (name, email, password, type, location) VALUES 
            ('Rider One', 'riderone@example.com', '<hashed_password>', 'rider', ST_SetSRID(ST_Point(-76.5368824, 3.4438444), 4326)),
            ('Rider Two', 'ridertwo@example.com', '<hashed_password>', 'rider', ST_SetSRID(ST_Point(-76.5368824, 3.4438444), 4326)),
            ('Driver One', 'driverone@example.com', '<hashed_password>', 'driver', ST_SetSRID(ST_Point(-76.5368824, 3.4438444), 4326)),
            ('Driver Two', 'drivertwo@example.com', '<hashed_password>', 'driver', ST_SetSRID(ST_Point(-76.5368824, 3.4438444), 4326))
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE users;`);
    }

}
