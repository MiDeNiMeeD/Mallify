FROM node:18-alpine

WORKDIR /app

# Copy shared utilities
COPY shared/ ./shared/

# Copy service files
COPY user-service/package*.json ./
RUN npm install --production

COPY user-service/ ./
RUN mkdir -p logs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "src/index.js"]
