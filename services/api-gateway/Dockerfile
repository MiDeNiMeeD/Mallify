FROM node:18-alpine

WORKDIR /app

# Copy shared utilities
COPY shared/ ./shared/

# Copy service files
COPY api-gateway/package*.json ./
RUN npm install --production

COPY api-gateway/ ./
RUN mkdir -p logs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "src/index.js"]
