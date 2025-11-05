FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache git

COPY client/package*.json ./client/
WORKDIR /app/client
RUN npm ci

COPY client/tsconfig.json ./
COPY client/src ./src
RUN npm run build

WORKDIR /app
COPY docs ./docs

ENV NODE_ENV=production

CMD ["node", "client/dist/index.js", "daemon"]
