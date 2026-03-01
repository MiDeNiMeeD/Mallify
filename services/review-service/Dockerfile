FROM node:18-alpine

WORKDIR /app

# Copy workspace package files
COPY package*.json ./

# Copy shared package
COPY shared ./shared

# Copy service files
COPY review-service/package*.json ./review-service/
COPY review-service/tsconfig.json ./review-service/

# Install dependencies (will link workspace packages)
RUN npm install --workspaces=false
RUN cd shared && npm install && npm run build
RUN cd review-service && npm install

# Copy service source
COPY review-service/src ./review-service/src

# Build service
RUN cd review-service && npm run build

WORKDIR /app/review-service

EXPOSE 3010

CMD ["npm", "start"]
