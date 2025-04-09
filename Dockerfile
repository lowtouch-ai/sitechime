# Stage 1: Build the application
FROM node:20-alpine AS build

# Define build arguments
# ARG CAPROVER_GIT_COMMIT_SHA
ARG VITE_BACKEND_API_URL
ARG VITE_OPENAI_HOST

# Set environment variables from build args
ENV VITE_BACKEND_API_URL=$VITE_BACKEND_API_URL
ENV VITE_OPENAI_HOST=$VITE_OPENAI_HOST
# ENV VITE_GIT_COMMIT_SHA=$CAPROVER_GIT_COMMIT_SHA

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