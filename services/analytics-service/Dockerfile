FROM node:18-alpine

WORKDIR /app

# Copy workspace package files
COPY package*.json ./

# Copy shared package
COPY shared ./shared

# Copy service files
COPY analytics-service/package*.json ./analytics-service/
COPY analytics-service/tsconfig.json ./analytics-service/

# Install dependencies (will link workspace packages)
RUN npm install --workspaces=false
RUN cd shared && npm install && npm run build
RUN cd analytics-service && npm install

# Copy service source
COPY analytics-service/src ./analytics-service/src

# Build service
RUN cd analytics-service && npm run build

WORKDIR /app/analytics-service

EXPOSE 3013

CMD ["npm", "start"]
