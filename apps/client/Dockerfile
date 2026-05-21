FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/server/package.json apps/server/package.json
COPY apps/client/package.json apps/client/package.json
COPY apps/cron/package.json apps/cron/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN npm ci

COPY . .

EXPOSE 5173

CMD ["npm", "--workspace", "apps/client", "run", "dev"]
