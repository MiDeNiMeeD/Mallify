FROM node:18-alpine

WORKDIR /app

# Copy workspace package files
COPY package*.json ./

# Copy shared package
COPY shared ./shared

# Copy service files
COPY payment-service/package*.json ./payment-service/
COPY payment-service/tsconfig.json ./payment-service/

# Install dependencies (will link workspace packages)
RUN npm install --workspaces=false
RUN cd shared && npm install && npm run build
RUN cd payment-service && npm install

# Copy service source
COPY payment-service/src ./payment-service/src

# Build service
RUN cd payment-service && npm run build

WORKDIR /app/payment-service

EXPOSE 3005

CMD ["npm", "start"]
