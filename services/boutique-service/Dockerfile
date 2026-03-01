FROM node:18-alpine

WORKDIR /app

# Copy workspace package files
COPY package*.json ./

# Copy shared package
COPY shared ./shared

# Copy service files
COPY boutique-service/package*.json ./boutique-service/
COPY boutique-service/tsconfig.json ./boutique-service/

# Install dependencies (will link workspace packages)
RUN npm install --workspaces=false
RUN cd shared && npm install && npm run build
RUN cd boutique-service && npm install

# Copy service source
COPY boutique-service/src ./boutique-service/src

# Build service
RUN cd boutique-service && npm run build

WORKDIR /app/boutique-service

EXPOSE 3003

CMD ["npm", "start"]
