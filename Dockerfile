FROM node:16 AS builder

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

FROM node:16 as production

ARG NODE_ENV=staging
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn install --production

COPY --from=builder /usr/src/app/dist ./dist

CMD ["node", "dist/main"]
