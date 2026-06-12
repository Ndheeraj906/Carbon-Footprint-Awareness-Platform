FROM node:20-alpine

WORKDIR /app

# Copy package configuration
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy application source files
COPY . .

# Cloud Run sets the PORT env variable automatically
EXPOSE 8080

# Run the secure Express server
CMD ["node", "server.js"]
