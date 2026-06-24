FROM node:22-bookworm-slim
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Generate Prisma client
COPY prisma ./prisma
RUN npx prisma generate

# Build the app
COPY . .
RUN npm run build

ENV NODE_ENV=production

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
