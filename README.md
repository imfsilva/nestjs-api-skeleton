<h1 align='center'>SKELETON</h1>

<p align='center'>
  <img alt="logo" src="src/assets/client/images/logo.svg" width="300">
</p>

> REST API developed with NestJS.

## First steps
1. Rename `skeleton` and `SKELETON` with your project name.

## Environment variables

Valid environment variable files: `.env.development`, `.env.staging`, `.env.production`, `.env.test`.

Example environment file:

```dotenv
NODE_ENV=development

# App
PORT=3000
CRYPTO_SECRET_KEY=
API_VERSION=v1.0.0

# JWT
AT_SECRET=
AT_EXPIRATION_TIME=15d
RT_SECRET=
RT_EXPIRATION_TIME=30d

# Rate limits
THROTTLE_TTL=60
THROTTLE_LIMIT=10

# S3
S3_URL=minio
S3_PUBLIC_URL=http://localhost:9000
S3_BUCKET_NAME=skeleton
S3_ACCESS_KEY=minio
S3_SECRET_KEY=minio123
S3_REGION=europe-west1
S3_PORT=9000

# Mailer
MAILER_HOST=
MAILER_PORT=
MAILER_SECURE= # true for 465, false for other ports
MAILER_USER=
MAILER_PASSWORD=
MAILER_OUTGOING_EMAIL=

# DB
DB_URL=postgresql://root:root@db:5432/skeleton
ENABLE_ORM_LOGS=false
```

## Get started

### Development

Create `.env.development` file in the root of the project.

```shell
$ docker network create skeleton
```

```shell
$ make development
```

### Staging

Create `.env.staging` file in the root of the project.

```shell
$ docker network create skeleton
```

```shell
$ make staging
```

### Production

Create `.env.production` in the root of the project.

```shell
$ yarn start:prod
```

## Seeds

To seed the database you can use one of the following commands depending on the environment.

```shell
$ make development-seed
$ make staging-seed
$ yarn seed:run
```

## Tests

Create `.env.test` file in the root of the project. 

Variables to be replaced from the example:

```dotenv
NODE_ENV=test
S3_URL=localhost
DB_URL=postgresql://root:root@localhost:5432/skeleton_test
```

```shell
$ yarn test // unit tests
$ yarn test:e2e // end to end tests
```

⚠️ To run e2e tests, docker services `db` and `minio` must be up.

## Migrations

Once our application is deployed to production, and we have to make a change that affects our database, such as changing the name of a column, we must make use of what we call migrations.

To create one we execute:

```shell
$ yarn migration:create <migration name>
```

The migration file will be created under `src/database/migrations`.

## Extra

 In the root of the project you can find a Postman project with all the available endpoints.
