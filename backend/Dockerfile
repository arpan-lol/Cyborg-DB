FROM node:18-alpine AS base

FROM base AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY src/prisma ./prisma
RUN npx prisma generate

FROM base AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
COPY tsconfig.json ./

RUN npx prisma generate --schema=src/prisma/schema.prisma

RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/src/prisma ./src/prisma

RUN --mount=type=bind,from=builder,source=/app,target=/mnt/builder \
    if [ -f /mnt/builder/google-creds.json ]; then \
      cp /mnt/builder/google-creds.json ./google-creds.json; \
    fi

EXPOSE 3008

CMD ["sh", "-c", "npx prisma migrate deploy --schema=src/prisma/schema.prisma && npm start"]