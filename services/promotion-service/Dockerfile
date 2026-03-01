FROM node:18-alpine

WORKDIR /app

# Copy workspace package files
COPY package*.json ./

# Copy shared package
COPY shared ./shared

# Copy service files
COPY promotion-service/package*.json ./promotion-service/
COPY promotion-service/tsconfig.json ./promotion-service/

# Install dependencies (will link workspace packages)
RUN npm install --workspaces=false
RUN cd shared && npm install && npm run build
RUN cd promotion-service && npm install

# Copy service source
COPY promotion-service/src ./promotion-service/src

# Build service
RUN cd promotion-service && npm run build

WORKDIR /app/promotion-service

EXPOSE 3011

CMD ["npm", "start"]
