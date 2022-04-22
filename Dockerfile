# Stage 1: Build
FROM node:gallium AS builder

WORKDIR /usr/src/app
COPY . .

RUN yarn install
RUN yarn build

# Stage 2: Run
FROM node:gallium as runner

ARG NODE_ENV=staging
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app
COPY package.json yarn.lock .env.staging ./

RUN yarn install --production

COPY --from=builder /usr/src/app/dist ./dist

CMD ["node", "dist/main"]
