FROM node:18-alpine

WORKDIR /app

# Copy workspace package files
COPY package*.json ./

# Copy shared package
COPY shared ./shared

# Copy service files
COPY notification-service/package*.json ./notification-service/
COPY notification-service/tsconfig.json ./notification-service/

# Install dependencies (will link workspace packages)
RUN npm install --workspaces=false
RUN cd shared && npm install && npm run build
RUN cd notification-service && npm install

# Copy service source
COPY notification-service/src ./notification-service/src

# Build service
RUN cd notification-service && npm run build

WORKDIR /app/notification-service

EXPOSE 3008

CMD ["npm", "start"]
