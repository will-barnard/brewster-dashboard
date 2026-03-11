# -- Stage 1: Build the Vue client --
FROM node:20-alpine AS client-build
WORKDIR /build/client
COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# -- Stage 2: Production server --
FROM node:20-alpine
WORKDIR /app

# Install server dependencies
COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm ci --omit=dev

# Copy server source
COPY server/ ./server/

# Copy built client
COPY --from=client-build /build/client/dist ./client/dist/

# .env and SQLite DB are mounted at runtime

EXPOSE 49195

CMD ["node", "server/index.js"]
