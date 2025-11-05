FROM node:20-alpine

WORKDIR /app/client

RUN apk add --no-cache git

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

ENV NODE_ENV=production

CMD ["node", "dist/index.js", "daemon"]
