FROM node:18-alpine

WORKDIR /app

# Copy workspace package files
COPY package*.json ./

# Copy shared package
COPY shared ./shared

# Copy service files
COPY cart-service/package*.json ./cart-service/
COPY cart-service/tsconfig.json ./cart-service/

# Install dependencies (will link workspace packages)
RUN npm install --workspaces=false
RUN cd shared && npm install && npm run build
RUN cd cart-service && npm install

# Copy service source
COPY cart-service/src ./cart-service/src

# Build service
RUN cd cart-service && npm run build

WORKDIR /app/cart-service

EXPOSE 3017

CMD ["npm", "start"]