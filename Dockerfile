FROM node:22-bookworm-slim
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Generate Prisma client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source files (.env excluded by .dockerignore)
COPY . .

# Build the Remix app (produces both build/client/ and build/server/)
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npx remix vite:build

ENV NODE_ENV=production

EXPOSE 3000
CMD ["npm", "start"]