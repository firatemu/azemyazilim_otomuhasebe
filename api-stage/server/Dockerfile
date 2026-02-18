# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Gerekli dosyaları kopyala
COPY server/package*.json ./server/
# Prisma şeması
COPY server/prisma ./server/prisma

# Bağımlılıkları kur
RUN cd server && npm install --legacy-peer-deps

# Uygulama kaynaklarını kopyala (node_modules hariç)
COPY server/src ./server/src
COPY server/tsconfig.json ./server/tsconfig.json
COPY server/nest-cli.json ./server/nest-cli.json

# Generate Prisma Client
RUN cd server && npx prisma generate --schema=./prisma/schema.prisma

# Build
RUN cd server && npm run build

# ---- Runtime stage ----
FROM node:20-alpine AS run
WORKDIR /app/server
ENV NODE_ENV=production

# Prod runtime dosyaları
COPY --from=build /app/server/node_modules ./node_modules
COPY --from=build /app/server/dist ./dist

# Runtime prisma client gerekiyorse
COPY --from=build /app/server/prisma ./prisma

EXPOSE 3000
CMD ["node", "/app/server/dist/src/main.js"]
