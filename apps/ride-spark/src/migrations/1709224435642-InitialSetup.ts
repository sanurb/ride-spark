import { MigrationInterface, QueryRunner } from 'typeorm';

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
            ('Rider Two', 'ridertwo@example.com', '<hashed_password>', 'rider', ST_SetSRID(ST_Point(-76.5328732, 3.4519238), 4326)),
            ('Driver One', 'driverone@example.com', '<hashed_password>', 'driver', ST_SetSRID(ST_Point(-76.5375118896857, 3.3659008724971926), 4326)),
            ('Driver Two', 'drivertwo@example.com', '<hashed_password>', 'driver', ST_SetSRID(ST_Point(-76.5218673, 3.3537033), 4326))
        `);

    await queryRunner.query(`
        CREATE SEQUENCE IF NOT EXISTS payment_methods_id_seq;

        CREATE TABLE IF NOT EXISTS payment_methods (
            created_at TIMESTAMP NOT NULL DEFAULT now(),
            updated_at TIMESTAMP NOT NULL DEFAULT now(),
            deleted_at TIMESTAMP,
            id INT NOT NULL DEFAULT nextval('payment_methods_id_seq'::regclass),
            wompi_token VARCHAR(255) NOT NULL,
            type VARCHAR(255) NOT NULL DEFAULT 'CARD',
            default_method BOOLEAN NOT NULL DEFAULT false,
            user_id INT,
            payment_source_id INT NOT NULL DEFAULT 0,
            CONSTRAINT FK_d7d7fb15569674aaadcfbc0428c FOREIGN KEY (user_id) REFERENCES users(id),
            PRIMARY KEY (id)
        );
    `);

    await queryRunner.query(`
        INSERT INTO payment_methods (created_at, updated_at, deleted_at, id, wompi_token, type, default_method, user_id, payment_source_id) VALUES
        ('2024-03-03 15:21:28.508325', '2024-03-03 15:21:28.508325', NULL, 1, 'tok_test_10967_43d72501f701496157b71984f1f00e2A', 'CARD', true, 1, 101414),
        ('2024-03-03 15:56:37.185168', '2024-03-03 15:56:37.185168', NULL, 2, 'tok_test_88255_d00cd3e9a11452AB8dba97c3DB9525a2', 'CARD', true, 2, 101415);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE users;`);
  }
}
