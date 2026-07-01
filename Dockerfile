FROM node:22-bookworm-slim
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Generate Prisma client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source files (exclude .env - Railway provides env vars)
COPY . .
# Remove .env if it was copied (Railway provides env vars)
RUN rm -f .env

# Build the app
RUN npm run build

ENV NODE_ENV=production

EXPOSE 3000
CMD ["npm", "start"]