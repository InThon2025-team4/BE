FROM node:20-bullseye-slim AS builder
WORKDIR /app

# Copy package manifests and install all dependencies (dev+prod) for build
COPY package.json package-lock.json ./
RUN npm ci --no-audit --prefer-offline

# Copy prisma schema and source
COPY prisma ./prisma
COPY . .

# Generate Prisma client for the target platform and build the app
RUN npx prisma generate
RUN npm run build

# Stage 2: create minimal production image
FROM node:20-bullseye-slim
WORKDIR /app

# Use non-root user for security
RUN groupadd -r app && useradd -r -g app app

# Set NODE_ENV
ENV NODE_ENV=production

# Copy only necessary files from builder
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --prefer-offline

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

USER app

CMD ["node", "dist/main.js"]
