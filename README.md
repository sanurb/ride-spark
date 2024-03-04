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
Remember that for local development purposes these lines of code should be commented out:
```js
// ssl: {
// rejectUnauthorized: false,
// }
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

Para mejorar la redacción y claridad de las instrucciones de testing, podrías reformular la sección de la siguiente manera:

---

## Testing Instructions

To ensure the functionality of the project components, follow these steps to run the automated tests:

### Prerequisites:

Ensure that you have Node.js installed on your system. You can download it from [Node.js official website](https://nodejs.org/).

### Installing Test Utilities:

We will use Newman, a command-line Collection Runner for Postman, and its `newman-reporter-htmlextra` plugin for better reporting. Install them globally using npm with the following commands:

```bash
npm install -g newman
npm install -g newman-reporter-htmlextra
```

### Running the Tests:

Navigate to the directory containing your Postman collection and environment files. You can do this from the terminal or command prompt:

```bash
cd ./postman
```

Once you are in the correct directory, initiate the test run using Newman with the following command:

```bash
newman run Ride-Spark.postman_collection.json -r htmlextra -e local.postman_environment.json
```

This command tells Newman to run the tests defined in `Ride-Spark.postman_collection.json`, using `local.postman_environment.json` for the environment settings, and generate a report using the `htmlextra` reporter.

### Viewing the Report:

After the tests have completed, a new HTML report will be generated in the `newman` directory. To view this report, navigate to the `newman` directory:

```bash
cd ./newman
```

Then, if you are using Windows, you can open the report directly with the following command:

```bash
start "" "Api Ride-Spark-2024-03-04-12-33-40-990-0.html"
```

For macOS or Linux, use the corresponding command to open HTML files with your default browser, for example:

```bash
open "Api Ride-Spark-2024-03-04-12-33-40-990-0.html" # for macOS
xdg-open "Api Ride-Spark-2024-03-04-12-33-40-990-0.html" # for Linux
```

The HTML report provides a detailed overview of the test results, including which tests passed or failed, and other relevant data.

```

## API Documentation

After starting the application, you can access the Swagger API documentation at `http://localhost:4444/swagger`

[Swagger Prod](https://api-ride-spark.onrender.com/swagger)

## Database Documentation

[Database documentation](https://dbdocs.io/sanurb/ride_spark)

## Contributing

We welcome contributions to the Ride-Spark Source project! Please refer to the `CONTRIBUTING.md` file for more information on how to submit pull requests, report issues, and suggest improvements.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

