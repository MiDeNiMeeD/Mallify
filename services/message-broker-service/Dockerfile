FROM node:18-alpine

WORKDIR /app

# Copy workspace package files
COPY package*.json ./

# Copy shared package
COPY shared ./shared

# Copy service files
COPY message-broker-service/package*.json ./message-broker-service/
COPY message-broker-service/tsconfig.json ./message-broker-service/

# Install dependencies (will link workspace packages)
RUN npm install --workspaces=false
RUN cd shared && npm install && npm run build
RUN cd message-broker-service && npm install

# Copy service source
COPY message-broker-service/src ./message-broker-service/src

# Build service
RUN cd message-broker-service && npm run build

WORKDIR /app/message-broker-service

EXPOSE 3016

CMD ["npm", "start"]
