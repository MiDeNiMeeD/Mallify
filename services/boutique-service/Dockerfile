FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm ci --only=production

COPY --from=shared /app/dist ./node_modules/@mallify/shared

COPY src ./src

RUN npm run build

EXPOSE 3003

CMD ["node", "dist/index.js"]
