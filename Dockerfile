# syntax=docker/dockerfile:1
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Dependencias de producción
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
# Artefactos compilados
COPY --from=builder /app/dist ./dist
ENV PORT=3000
EXPOSE 3000
CMD ["node", "dist/main.js"]
