FROM node:18-alpine

WORKDIR /app

# Copy workspace package files
COPY package*.json ./

# Copy shared package
COPY shared ./shared

# Copy service files
COPY wishlist-service/package*.json ./wishlist-service/
COPY wishlist-service/tsconfig.json ./wishlist-service/

# Install dependencies (will link workspace packages)
RUN npm install --workspaces=false
RUN cd shared && npm install && npm run build
RUN cd wishlist-service && npm install

# Copy service source
COPY wishlist-service/src ./wishlist-service/src

# Build service
RUN cd wishlist-service && npm run build

WORKDIR /app/wishlist-service

EXPOSE 3012

CMD ["npm", "start"]
