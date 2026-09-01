# Multi-stage Dockerfile for Quiz ECA Digital - DPRJ
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=10000
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist

# Create persistent data directory if needed
RUN mkdir -p /var/data
ENV DATA_DIR=/var/data

EXPOSE 10000
CMD ["node", "dist/server.cjs"]
