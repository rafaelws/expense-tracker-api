FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM node:22-alpine AS production

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000

CMD ["sh", "/entrypoint.sh"]

# HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
#   CMD wget --spider -q http://localhost:3000/health || exit 1