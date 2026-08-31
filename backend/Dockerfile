FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies required for better-sqlite3 compilation if needed
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 4000

ENV PORT=4000
ENV NODE_ENV=production

CMD ["node", "server.js"]
