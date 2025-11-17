FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./


RUN npm ci --legacy-peer-deps && npm cache clean --force

COPY . .

RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

RUN apk add --no-cache dumb-init

COPY package*.json ./


RUN npm ci --omit=dev --legacy-peer-deps && npm cache clean --force

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

USER node

CMD ["dumb-init", "node", "dist/main"]
