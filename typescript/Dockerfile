FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

FROM node:22-alpine
WORKDIR /app

# wget is part of busybox in node:alpine; used by the HEALTHCHECK below.
COPY --from=builder /app/dist ./dist/
COPY --from=builder /app/package.json /app/package-lock.json ./
RUN npm ci --omit=dev

ENV NODE_ENV=production
# Sevalla overrides $PORT at runtime; this is just a safe default.
ENV PORT=8080

USER node
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/health" || exit 1

CMD ["node", "dist/index.js"]
