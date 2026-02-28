FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Copy shared package
COPY --from=shared /app/dist ./node_modules/@mallify/shared

# Copy source
COPY src ./src

# Build
RUN npm run build

# Expose port
EXPOSE 3002

# Start service
CMD ["node", "dist/index.js"]
