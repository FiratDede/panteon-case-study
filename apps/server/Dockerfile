FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
COPY apps/server/package.json apps/server/package.json
COPY apps/client/package.json apps/client/package.json
COPY apps/cron/package.json apps/cron/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN npm ci

COPY . .

RUN npm --workspace packages/shared run build
RUN npx prisma generate --schema apps/server/prisma/schema.prisma

EXPOSE 4000

CMD ["npm", "--workspace", "apps/server", "run", "dev"]
