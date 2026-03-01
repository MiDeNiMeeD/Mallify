FROM node:18-alpine

WORKDIR /app

# Copy workspace package files
COPY package*.json ./

# Copy shared package
COPY shared ./shared

# Copy service files
COPY audit-service/package*.json ./audit-service/
COPY audit-service/tsconfig.json ./audit-service/

# Install dependencies (will link workspace packages)
RUN npm install --workspaces=false
RUN cd shared && npm install && npm run build
RUN cd audit-service && npm install

# Copy service source
COPY audit-service/src ./audit-service/src

# Build service
RUN cd audit-service && npm run build

WORKDIR /app/audit-service

EXPOSE 3014

CMD ["npm", "start"]
