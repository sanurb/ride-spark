import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSetup1709224435642 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE EXTENSION IF NOT EXISTS postgis;
        `);

    await queryRunner.query(`
        DO $$ BEGIN
            CREATE TYPE "user_type_enum" AS ENUM('rider', 'driver');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    `);

    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255),
            email VARCHAR(255) UNIQUE,
            password VARCHAR(255),
            type "user_type_enum" NOT NULL DEFAULT 'rider',
            location GEOMETRY(Point, 4326),
            last_location_update TIMESTAMP,
            CONSTRAINT "CHK_001" CHECK (char_length(name) > 0),
            CONSTRAINT "CHK_002" CHECK (char_length(email) > 0),
            CONSTRAINT "CHK_003" CHECK (char_length(password) > 0)
        );
    `);

    await queryRunner.query(`
            INSERT INTO users (name, email, password, type, location) VALUES
            ('Rider One', 'riderone@example.com', '<hashed_password>', 'rider', ST_SetSRID(ST_Point(-76.5368824, 3.4438444), 4326)),
            ('Rider Two', 'ridertwo@example.com', '<hashed_password>', 'rider', ST_SetSRID(ST_Point(-76.5328732, 3.4519238), 4326)),
            ('Rider Three', 'riderthree@example.com', '<hashed_password>', 'rider', ST_SetSRID(ST_Point(-76.52035117567739, 3.344184466878147), 4326)),
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
            _wompi_token TEXT NOT NULL,
            type VARCHAR(255) NOT NULL DEFAULT 'CARD',
            default_method BOOLEAN NOT NULL DEFAULT false,
            user_id INT,
            payment_source_id INT NOT NULL DEFAULT 0,
            CONSTRAINT FK_d7d7fb15569674aaadcfbc0428c FOREIGN KEY (user_id) REFERENCES users(id),
            PRIMARY KEY (id)
        );
    `);

    await queryRunner.query(`
        INSERT INTO payment_methods (created_at, updated_at, deleted_at, id, _wompi_token, type, default_method, user_id, payment_source_id) VALUES
        ('2024-03-03 15:21:28.508325', '2024-03-03 15:21:28.508325', NULL, 1, '72726e8a1b0cefaec0efe32d3fc29a19f9dfb5d0c8889db7c50a5d2eec406cf2dec922d2f38d98036de57219c194fe13', 'CARD', true, 1, 101536),
        ('2024-03-03 15:56:37.185168', '2024-03-03 15:56:37.185168', NULL, 2, '1658ceefda39d6217c168b8bdfeaaaa6932ec51d4ba65553eafcbb9770767b72f9d1326a499fea2dfd7006d68d441cd3', 'CARD', true, 2, 101537);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS payment_methods;`);
    await queryRunner.query(`DROP TABLE IF EXISTS users;`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_type_enum";`);
  }
}
