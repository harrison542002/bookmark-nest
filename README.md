## Description

This is a NestJS backend API with Prisma and Postgreql.

## Prerequisites

- NodeJS environment installed
- Docker desktop installed

## Features

- Authentication in JWT by utilizing jwt and passport npm packages.
- Easy initilization of Postgreql db with docker-compose.yml file.
- Fast typescript compiler in development with SWC.
- User can register and sign in with credentails.
- User can create bookmark
- TDD practice with E2E tests by utilizing JEST and Pactum.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# start postgreql db
$ npm run db:dev:restart

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
