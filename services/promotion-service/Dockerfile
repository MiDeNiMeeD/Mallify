FROM node:18-alpine

WORKDIR /app

# Copy shared utilities
COPY shared/ ./shared/

# Copy service files
COPY promotion-service/package*.json ./
RUN npm install --production

COPY promotion-service/ ./
RUN mkdir -p logs

EXPOSE 3014

# Set NODE_PATH so shared folder can find node_modules
ENV NODE_PATH=/app/node_modules

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3014/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "src/index.js"]

