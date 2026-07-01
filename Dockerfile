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

# Build the app
RUN npm run build

ENV NODE_ENV=production

EXPOSE 3000
CMD ["npm", "start"]