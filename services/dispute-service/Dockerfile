FROM node:18-alpine

WORKDIR /app

# Copy shared utilities
COPY shared/ ./shared/

# Copy service files
COPY dispute-service/package*.json ./
RUN npm install --production

COPY dispute-service/ ./
RUN mkdir -p logs

EXPOSE 3016

# Set NODE_PATH so shared folder can find node_modules
ENV NODE_PATH=/app/node_modules

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3016/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "src/index.js"]

