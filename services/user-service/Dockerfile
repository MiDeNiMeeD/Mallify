FROM node:18-alpine

WORKDIR /app

# Copy workspace package files
COPY package*.json ./

# Copy shared package
COPY shared ./shared

# Copy service files
COPY user-service/package*.json ./user-service/
COPY user-service/tsconfig.json ./user-service/

# Install dependencies (will link workspace packages)
RUN npm install --workspaces=false
RUN cd shared && npm install && npm run build
RUN cd user-service && npm install

# Copy service source
COPY user-service/src ./user-service/src

# Build service
RUN cd user-service && npm run build

WORKDIR /app/user-service

EXPOSE 3001

CMD ["npm", "start"]
