# Dockerfile - Monolithic container for Vite Frontend + Express API

# Build stage for React Frontend
FROM node:20-alpine AS build
WORKDIR /app
# We only need the client directory to build
COPY client/package*.json ./client/
WORKDIR /app/client
RUN npm ci
COPY client/ ./
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

# Copy server files
COPY server/package*.json ./server/
WORKDIR /app/server
# We use npm ci for predictable installs
RUN npm ci --only=production
COPY server/ ./

# Copy built frontend from build stage to server public directory
# Express will serve these static files
COPY --from=build /app/client/dist ./public

# Expose port (Cloud Run defaults to 8080)
EXPOSE 8080

# Run the Node server
CMD ["node", "index.js"]
