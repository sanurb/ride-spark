# RideSpark

Welcome to the Ride-Spark Source project, a backend solution designed for ride-sharing services. This project utilizes NestJS, TypeORM, and other powerful technologies to provide a robust API for managing rides, users, and transactions.

## Requirements

Before you start, make sure you have the following installed on your system:

- Node.js (version 16 or above recommended)
- Docker and Docker Compose
- Git (for cloning the repository)

## Setup and Installation

1. **Clone the repository:**

   Start by cloning the repository to your local machine:

   ```bash
   git clone https://github.com/sanurb/ride-spark.git
   cd ride-spark
   ```

2. **Install dependencies:**

   Inside the project directory, install the necessary npm packages:

   ```bash
   npm install
   ```

3. **Start the PostgreSQL database with Docker:**

   You need a PostgreSQL database to run this project. The easiest way to get one up and running is by using Docker:

   ```bash
   cd ./apps/ride-spark
   docker-compose up -d
   ```

   This command starts a Docker container in the background with PostgreSQL.

4. **Run database migrations:**

   After setting up the database, apply the migrations to structure it correctly:

   ```bash
   npm run typeorm-build-config
   npm run typeorm:run-migrations
   ```

   This command runs the migrations necessary for the project using the compiled JS files.

## Development

make sure to create the .env file with the values of .env.example and that the database is running

To start the development server, use the following command:

```bash
npm run dev
```

This command starts the NestJS application in development mode with hot-reload enabled.


Alternatively it can be run with docker

```bash
docker build -f Dockerfile -t ridespark .
docker run -d -p 4444:4444 --name ridespark-instance --env-file ./.env ridespark
docker logs ridespark-instance
```

## Additional Commands

- **Create a new TypeORM migration:**

  If you need to create a new database migration, use the following command:

  ```bash
  npm run typeorm:create-migration -- <MigrationName>
  ```

  Replace `<MigrationName>` with the name of your migration.

- **Revert the last migration:**

  To revert the most recently applied migration, you can use:

  ```bash
  npm run typeorm:revert-migrations
  ```

## Testing

To run the tests for the project, execute:

```bash
npx nx run ride-spark:test
```

This command runs all the Jest tests in the project but no in libs.

## API Documentation

After starting the application, you can access the Swagger API documentation at `http://localhost:4444/swagger`

## Contributing

We welcome contributions to the Ride-Spark Source project! Please refer to the `CONTRIBUTING.md` file for more information on how to submit pull requests, report issues, and suggest improvements.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

