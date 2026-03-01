FROM node:18-alpine

WORKDIR /app

# Copy workspace package files
COPY package*.json ./

# Copy shared package
COPY shared ./shared

# Copy service files
COPY chat-service/package*.json ./chat-service/
COPY chat-service/tsconfig.json ./chat-service/

# Install dependencies (will link workspace packages)
RUN npm install --workspaces=false
RUN cd shared && npm install && npm run build
RUN cd chat-service && npm install

# Copy service source
COPY chat-service/src ./chat-service/src

# Build service
RUN cd chat-service && npm run build

WORKDIR /app/chat-service

EXPOSE 3009

CMD ["npm", "start"]
