# Stage 1: Build the application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json first for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the application with serve
FROM node:20-alpine

WORKDIR /app

# Install serve
RUN npm install -g serve

# Copy built assets from the build stage
COPY --from=build /app/dist /app/dist

# Expose port 3000 (default for serve)
EXPOSE 3000

# Start serve
CMD ["serve", "-s", "dist", "-l", "3000"]