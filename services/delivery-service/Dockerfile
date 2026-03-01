FROM node:18-alpine

WORKDIR /app

# Copy workspace package files
COPY package*.json ./

# Copy shared package
COPY shared ./shared

# Copy service files
COPY delivery-service/package*.json ./delivery-service/
COPY delivery-service/tsconfig.json ./delivery-service/

# Install dependencies (will link workspace packages)
RUN npm install --workspaces=false
RUN cd shared && npm install && npm run build
RUN cd delivery-service && npm install

# Copy service source
COPY delivery-service/src ./delivery-service/src

# Build service
RUN cd delivery-service && npm run build

WORKDIR /app/delivery-service

EXPOSE 3006

CMD ["npm", "start"]
