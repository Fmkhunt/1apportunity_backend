# Stage 1: Build the TypeScript code
FROM node:22 AS builder

# Create app directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

# Build TypeScript code
RUN npm run build

# Stage 2: Run the compiled app
FROM node:22-alpine

WORKDIR /app

# Copy only the compiled JS and dependencies
COPY --from=builder /app/package*.json ./
RUN npm install --only=production

COPY --from=builder /app/dist ./dist

# Copy environment file (if it exists)
COPY --from=builder /app/.env* ./

# Expose the port your app runs on
EXPOSE 3003

# Start the app
CMD ["node", "dist/app.js"]