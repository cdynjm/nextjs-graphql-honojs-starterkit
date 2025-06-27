# Step 1: Build app
FROM node:22-alpine AS builder
WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Step 2: Serve app
FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production

# Copy built app from builder
COPY --from=builder /app ./

# Expose default Next.js port
EXPOSE 3000

# Start app
CMD ["npm", "start"]
