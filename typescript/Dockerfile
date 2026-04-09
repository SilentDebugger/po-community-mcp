FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/dist ./dist/
COPY --from=builder /app/package.json /app/package-lock.json ./
RUN npm ci --omit=dev

USER node
EXPOSE 5000
CMD ["node", "dist/index.js"]
