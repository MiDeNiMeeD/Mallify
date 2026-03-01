FROM node:18-alpine

WORKDIR /app

# Copy workspace package files
COPY package*.json ./

# Copy shared package
COPY shared ./shared

# Copy service files
COPY product-service/package*.json ./product-service/
COPY product-service/tsconfig.json ./product-service/

# Install dependencies (will link workspace packages)
RUN npm install --workspaces=false
RUN cd shared && npm install && npm run build
RUN cd product-service && npm install

# Copy service source
COPY product-service/src ./product-service/src

# Build service
RUN cd product-service && npm run build

WORKDIR /app/product-service

EXPOSE 3002

CMD ["npm", "start"]
