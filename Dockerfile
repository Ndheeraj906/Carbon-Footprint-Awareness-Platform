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

# Serve static files on the specified PORT
CMD ["sh", "-c", "npx http-server -p ${PORT:-8080}"]
