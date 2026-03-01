FROM node:18-alpine

WORKDIR /app

# Copy workspace package files
COPY package*.json ./

# Copy shared package
COPY shared ./shared

# Copy service files
COPY api-gateway/package*.json ./api-gateway/
COPY api-gateway/tsconfig.json ./api-gateway/

# Install dependencies (will link workspace packages)
RUN npm install --workspaces=false
RUN cd shared && npm install && npm run build
RUN cd api-gateway && npm install

# Copy service source
COPY api-gateway/src ./api-gateway/src

# Build service
RUN cd api-gateway && npm run build

WORKDIR /app/api-gateway

EXPOSE 4000

CMD ["npm", "start"]
