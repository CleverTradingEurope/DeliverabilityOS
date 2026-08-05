# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm ci

# Copy the rest of the code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:22-alpine

WORKDIR /app

# Copy built assets and package configuration
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server.ts ./server.ts

# Install ONLY production dependencies
RUN npm ci --omit=dev

# Switch to a non-root user for better security
USER node

EXPOSE 3000

# Start the built server using npm start (which runs node dist/server.cjs)
CMD ["npm", "start"]
