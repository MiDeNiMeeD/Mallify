FROM node:18-alpine

WORKDIR /app

# Copy workspace package files
COPY package*.json ./

# Copy shared package
COPY shared ./shared

# Copy service files
COPY driver-service/package*.json ./driver-service/
COPY driver-service/tsconfig.json ./driver-service/

# Install dependencies (will link workspace packages)
RUN npm install --workspaces=false
RUN cd shared && npm install && npm run build
RUN cd driver-service && npm install

# Copy service source
COPY driver-service/src ./driver-service/src

# Build service
RUN cd driver-service && npm run build

WORKDIR /app/driver-service

EXPOSE 3007

CMD ["npm", "start"]
