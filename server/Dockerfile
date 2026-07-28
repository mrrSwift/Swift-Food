# Build stage
FROM oven/bun:1 AS builder
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun build src/index.ts --outdir dist --target bun --minify --sourcemap=external

# Production stage
FROM oven/bun:1-slim
WORKDIR /app

# Copy built files and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Create directories for uploads
RUN mkdir -p public/uploads/category public/uploads/restaurant public/uploads/menu

ENV NODE_ENV=production
EXPOSE 3000

CMD ["bun", "run", "dist/index.js"]