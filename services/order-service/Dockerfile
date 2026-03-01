FROM node:18-alpine

WORKDIR /app

# Copy workspace package files
COPY package*.json ./

# Copy shared package
COPY shared ./shared

# Copy service files
COPY order-service/package*.json ./order-service/
COPY order-service/tsconfig.json ./order-service/

# Install dependencies (will link workspace packages)
RUN npm install --workspaces=false
RUN cd shared && npm install && npm run build
RUN cd order-service && npm install

# Copy service source
COPY order-service/src ./order-service/src

# Build service
RUN cd order-service && npm run build

WORKDIR /app/order-service

EXPOSE 3004

CMD ["npm", "start"]
