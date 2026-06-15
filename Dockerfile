FROM node:20 AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production
COPY . .
# No build step needed for native ES modules

FROM node:20
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
COPY --from=builder /app .
EXPOSE 8080
CMD ["node", "server.js"]
