### travel_tool_back

[![CircleCI](https://circleci.com/gh/andela/travel_tool_back.svg?style=svg&circle-token=6b9b93c91b2b5db0ec3e700ea2da8a4f56486df5)](https://circleci.com/gh/andela/travel_tool_back)
[![Maintainability](https://api.codeclimate.com/v1/badges/e827017c4dbdedc8e944/maintainability)](https://codeclimate.com/repos/5c35c067613b2b0286009fd2/maintainability)
[![Coverage](https://api.codeclimate.com/v1/badges/e827017c4dbdedc8e944/test_coverage)](https://codeclimate.com/repos/5c37071dd1bdba0258009e21/test_coverage)



An application for managing travel in Andela.

# Description

**travel_tool_back** is the backend application for the Andela Travel application which automates travel processes in Andela. This application also helps to collate and manage all travel-related data across Andela's locations.

# Table of Contents

- [Documentation](#documentation)
- [Setup](#setup)
  - [Dependencies](#dependencies)
  - [Getting Started](#getting-started)
  - [Environment Variables](#environment-variables)
  - [Database and ORM](#database-and-orm)
  - [Docker](#run-the-service-using-docker)
- [Testing](#testing)
- [Prototype](#prototype)
- [Contribute](#contribute)
- [Deployment](#deployment)
- [License](#license)
- [Technical Charts](#technical-charts)

## Documentation

[Link to Documentation](https://documenter.getpostman.com/view/5772810/S1ZxbV12)

## Setup

### Dependencies

- [NodeJS](https://github.com/nodejs/node) - A JavaScript runtime environment
- [Express](https://github.com/expressjs/express) - A web application framework for NodeJS
- [PostgreSQL](https://github.com/postgres/postgres) - A relational database management system that extends SQL
- [Sequelize](https://github.com/sequelize/sequelize) - A promise-based ORM for NodeJS
- [Passport](https://github.com/jaredhanson/passport) - An authentication middleware for NodeJS

### Getting Started

Follow these steps to set up the project in development mode

- Install [Nodejs](https://nodejs.org/en/download/)
- Install and setup [PostgreSQL](https://www.postgresql.org/)
- Clone the repository by running the command
  ```
  git clone https://github.com/andela/travel_tool_back.git
  ```
- Run `cd travel_tool_back` to enter the application's directory
- Install the application's dependencies by running the command
  ```
  yarn install
  ```
- Create a `.env` file in the root of your directory using the `.env.example` file in the repository
- Setup the database and migrations (**_see [database setup](#database-and-orm, 'setting up database')_**)
- Start the application by running
  ```
  yarn run start:dev
  ```
  The application should now be running at `http://127.0.0.1:5000`

### Environment Variables

 Create your `.env` file in the root directory by following the `.env.example` below
  ```
  DATABASE_URL=postgres://user:password@domain:port/database_name
  JWT_PUBLIC_KEY=input public token
  PORT=your app port (optional, default 5000)
  DEFAULT_ADMIN=someemail@andela.com
  REMINDER_INTERVAL=15000
  BUGSNAG_API_KEY=Bugsnag project api key
  NODE_ENV=environment for putting the app in maintenance mode
  SENDGRID_API_KEY=sendgrid api
  REDIRECT_URL=frontend baseurl
  APP_EMAIL=travela app email
  MAILGUN_API_KEY=mailgun api key
  MAILGUN_DOMAIN_NAME=mailgun domain name
  MAIL_SENDER=travel sender mail
  ANDELA_PROD_API=production url
  BAMBOOHR_API=bamboohr api
  DEFAULT_SUPER_USER_ID=default id
  BAMBOOHRID_API=bamboohr directory
  ```

### Database and ORM

- Create a database in `PostgreSQL` and name it `travel_tool`
- Run database migrations
  ```
  yarn run db:migrate and yarn run db:user:migrate
  ```
- Check the database and confirm that the `users` table has been created

### More about environmental variables

After setting up your `.env` from the template provided in the `.env.example` file,
to use these variables anywhere in the app;

- import the `dotenv` package

```
import dotenv from 'dotenv'
```

- Make it available for use as early as possible in that file

```
dotenv.config()
```

- Access any variable in the `.env`

```
process.env.MY_ENV_VARIABLE
```

### Run the Service Using Docker

> NOTE: Make sure no service is running on port 5000.

To run the application just type: `make start`

this would run your application inside a container which you can easily access using `localhost:5000`.

To stop the application, you can just hit `^c`.

To delete the containers: `make stop`

> WARNING: Running below command will make you loose all your data including data in the database!

To cleanup all the containers + volumes: `make clean`

> NOTE: The below commands should be run when the application is running inside container

To migrate database: `make migrate`

To seed database: `make seed`

To rollback migrations: `make rollback`

To get inside the container: `make ssh`

## Testing

[Jest](https://jestjs.io) is used as the testing framework for both the unit tests and integration tests.
To execute all tests, run the command

```
  yarn test or make test
```

## Prototype

The application is staged [here](https://travela-staging.andela.com/)

## Contribute

Contributions to the project are welcome! Before contributing, look through the branch naming, commit message and pull request conventions [here](https://github.com/andela/engineering-playbook/tree/master/5.%20Developing/Conventions). When you are all done, follow the guidelines below to raise a pull request:

- Identify the feature, chore or bug to be worked on from the [pivotal tracker board](https://www.pivotaltracker.com/n/projects/2184887). If the ticket does not exist on the board, consult the project owners for approval before adding the ticket to the board.
- Clone the repository and checkout from `develop` to a new branch to start working on the assigned task. Ensure branch names follow the convention linked above.
- Work on the task following the coding standards and [style guide](https://github.com/airbnb/javascript) used in the project.
- When task has been completed, make commits and raise a pull request against `develop` branch, also ensure to follow the conventions linked above.

If the pull request is accepted by the owners of the repository, then it is merged into the `develop` branch and closed.

## Deployment

Deployment in this project happens under two circumstances.
- When a PR has been successfully merged to `develop`, the application is deployed to the `staging` environment.
- When `QA` and `QC` tests have been successfully carried out and merged to `master`, the application is deployed to the `production` environment

[Jenkins](https://jenkins.io/doc/) is used to hanlde support for automatating the implementation and integration of continuous delivery pipelines.

The deployment scripts for the application are hosted [here](https://github.com/andela/travel_tool_deployment_scripts)

## License

This application is licensed under the terms of the [MIT License](https://github.com/andela/travel_tool_back/blob/develop/LICENSE)

## Technical Charts

[Architectural Diagram](https://www.lucidchart.com/invitations/accept/777cc1cd-1e62-4ccc-867c-2d0c6f9e85ec)