<div align = "center">

<h1><a href="https://github.com/sanurb/ride-spark">ride-spark</a></h1>

<a href="https://github.com/sanurb/ride-spark/blob/main/LICENSE">
<img alt="License" src="https://img.shields.io/github/license/sanurb/ride-spark?style=flat&color=eee&label="> </a>

<a href="https://github.com/sanurb/ride-spark/graphs/contributors">
<img alt="People" src="https://img.shields.io/github/contributors/sanurb/ride-spark?style=flat&color=ffaaf2&label=People"> </a>

<a href="https://github.com/sanurb/ride-spark/stargazers">
<img alt="Stars" src="https://img.shields.io/github/stars/sanurb/ride-spark?style=flat&color=98c379&label=Stars"></a>

<a href="https://github.com/sanurb/ride-spark/network/members">
<img alt="Forks" src="https://img.shields.io/github/forks/sanurb/ride-spark?style=flat&color=66a8e0&label=Forks"> </a>

<a href="https://github.com/sanurb/ride-spark/watchers">
<img alt="Watches" src="https://img.shields.io/github/watchers/sanurb/ride-spark?style=flat&color=f5d08b&label=Watches"> </a>

<a href="https://github.com/sanurb/ride-spark/pulse">
<img alt="Last Updated" src="https://img.shields.io/github/last-commit/sanurb/ride-spark?style=flat&color=e06c75&label="> </a>

<h3>Revolutionizing Rideshare: Spark Your Journey! 🚀✨</h3>


</div>


Welcome to the Ride-Spark Source project, a backend solution designed for ride-sharing services. This project utilizes NestJS, TypeORM, and other powerful technologies to provide a robust API for managing rides, users, and transactions.

## ✨ Features

- **Robust Wompi Integration for Payments:** Leverages advanced security protocols and efficient algorithms to ensure safe and rapid processing of payment methods and transactions. Our backend is designed to seamlessly handle the complexities of financial transactions, providing a secure and reliable payment experience tailored for ride-sharing services.

- **Streamlined Ride Initiation Process:** Utilizes a sophisticated, algorithm-driven approach to streamline the ride request and initiation process. By focusing on optimizing the user experience, our backend system ensures that initiating a ride is as smooth and effortless as possible, setting a new standard for user convenience in ride-sharing platforms.

- **Dynamic Fare Calculation Algorithm:** Implements a comprehensive fare calculation system that accurately considers distance, time, and base fare in its computations. This algorithm is designed to provide precise fare estimates, ensuring transparency and fairness in pricing for both riders and drivers. Our methodological approach to fare calculation takes into account the dynamic variables of each ride, offering a refined and adaptable solution for fare estimation.

## ⚙️ Requirements

Before you start, make sure you have the following installed on your system:

- Node.js (version 16 or above recommended)
- Docker and Docker Compose
- Git (for cloning the repository)

## 💻 Setup and Installation

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

## 🚀 Development

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

## 🧪 Testing Instructions

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

