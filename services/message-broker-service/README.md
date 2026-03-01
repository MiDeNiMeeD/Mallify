# Message Broker Service

A dedicated microservice for managing RabbitMQ message queues and providing a REST API for message publishing and consumption.

## Overview

The Message Broker Service acts as a centralized gateway for all message queue operations in the Mallify platform. Instead of each microservice managing its own RabbitMQ connections, they can use this service's REST API for:

- Publishing messages to queues or exchanges
- Creating and managing queues
- Binding queues to exchanges
- Getting queue information
- Purging and deleting queues

## Features

- ✅ REST API for RabbitMQ operations
- ✅ Automatic reconnection on connection loss
- ✅ Queue management (create, delete, purge)
- ✅ Exchange support with routing keys
- ✅ Health check endpoints
- ✅ Comprehensive logging
- ✅ TypeScript support
- ✅ Docker ready

## Technology Stack

- **Runtime**: Node.js 18
- **Framework**: Express.js
- **Message Queue**: RabbitMQ (amqplib)
- **Language**: TypeScript
- **Logging**: Winston (via @mallify/shared)

## Environment Variables

```env
PORT=3016
NODE_ENV=production
RABBITMQ_URL=amqp://mallify:mallify_password@rabbitmq:5672
```

## Installation

```bash
# Install dependencies
npm install

# Build the service
npm run build

# Start the service
npm start

# Development mode with hot reload
npm run dev
```

## Docker

```bash
# Build Docker image
docker build -t mallify-message-broker-service .

# Run container
docker run -p 3016:3016 \
  -e RABBITMQ_URL=amqp://mallify:mallify_password@rabbitmq:5672 \
  mallify-message-broker-service
```

## API Endpoints

### Health Check

```http
GET /health
GET /api/messages/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "message-broker-service",
  "rabbitmq": "connected",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

### Publish Message to Queue

```http
POST /api/messages/publish
Content-Type: application/json

{
  "queue": "order-processing",
  "message": {
    "orderId": "123",
    "status": "pending"
  },
  "options": {
    "persistent": true,
    "expiration": "60000"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "published": true
  },
  "message": "Message published successfully"
}
```

### Publish Message to Exchange

```http
POST /api/messages/publish
Content-Type: application/json

{
  "exchange": "orders",
  "routingKey": "order.created",
  "message": {
    "orderId": "123",
    "customerId": "456"
  }
}
```

### Create Queue

```http
POST /api/messages/queue
Content-Type: application/json

{
  "queue": "order-processing",
  "options": {
    "durable": true,
    "exclusive": false,
    "autoDelete": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "queue": "order-processing"
  },
  "message": "Queue created successfully"
}
```

### Bind Queue to Exchange

```http
POST /api/messages/bind
Content-Type: application/json

{
  "queue": "order-processing",
  "exchange": "orders",
  "routingKey": "order.*"
}
```

### Get Queue Information

```http
GET /api/messages/queue/order-processing
```

**Response:**
```json
{
  "success": true,
  "data": {
    "queue": "order-processing",
    "messageCount": 42,
    "consumerCount": 2
  }
}
```

### Delete Queue

```http
DELETE /api/messages/queue/order-processing
```

**Response:**
```json
{
  "success": true,
  "message": "Queue deleted successfully"
}
```

### Purge Queue

```http
POST /api/messages/queue/order-processing/purge
```

**Response:**
```json
{
  "success": true,
  "message": "Queue purged successfully"
}
```

## Usage Example

### From Node.js/TypeScript Service

```typescript
import axios from 'axios';

const MESSAGE_BROKER_URL = 'http://message-broker-service:3016';

// Publish a message
async function publishOrderCreated(orderId: string) {
  try {
    const response = await axios.post(`${MESSAGE_BROKER_URL}/api/messages/publish`, {
      queue: 'order-processing',
      message: {
        orderId,
        event: 'order.created',
        timestamp: new Date().toISOString()
      }
    });
    
    console.log('Message published:', response.data);
  } catch (error) {
    console.error('Failed to publish message:', error);
  }
}

// Create a queue
async function createQueue(queueName: string) {
  try {
    const response = await axios.post(`${MESSAGE_BROKER_URL}/api/messages/queue`, {
      queue: queueName,
      options: {
        durable: true
      }
    });
    
    console.log('Queue created:', response.data);
  } catch (error) {
    console.error('Failed to create queue:', error);
  }
}
```

### Using cURL

```bash
# Publish a message
curl -X POST http://localhost:3016/api/messages/publish \
  -H "Content-Type: application/json" \
  -d '{
    "queue": "order-processing",
    "message": {
      "orderId": "123",
      "status": "pending"
    }
  }'

# Get queue info
curl http://localhost:3016/api/messages/queue/order-processing

# Health check
curl http://localhost:3016/health
```

## Architecture

```
┌─────────────────────────────────────────────┐
│         Message Broker Service               │
│                                              │
│  ┌──────────────┐    ┌─────────────────┐   │
│  │   Express    │───>│   Controllers   │   │
│  │   Routes     │    └─────────────────┘   │
│  └──────────────┘             │             │
│                                │             │
│                    ┌───────────▼──────────┐ │
│                    │  Message Queue       │ │
│                    │  Service             │ │
│                    └───────────┬──────────┘ │
│                                │             │
│                    ┌───────────▼──────────┐ │
│                    │  RabbitMQ            │ │
│                    │  Connection          │ │
│                    └───────────┬──────────┘ │
└────────────────────────────────┼────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │     RabbitMQ Server     │
                    │  (External Container)   │
                    └─────────────────────────┘
```

## Project Structure

```
message-broker-service/
├── src/
│   ├── config/
│   │   └── rabbitmq.ts          # RabbitMQ connection management
│   ├── controllers/
│   │   └── message.controller.ts # Request handlers
│   ├── routes/
│   │   └── message.routes.ts     # API routes
│   ├── services/
│   │   └── messageQueue.ts       # Queue operations
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces
│   └── index.ts                  # Main application
├── Dockerfile
├── package.json
├── tsconfig.json
└── README.md
```

## Best Practices

1. **Message Durability**: Always set `persistent: true` for important messages
2. **Queue Durability**: Use `durable: true` for queues that should survive restarts
3. **Error Handling**: Implement proper error handling when consuming messages
4. **Message Format**: Use JSON for message payloads for consistency
5. **Routing Keys**: Use dot notation for routing keys (e.g., `order.created`, `payment.processed`)

## Integration with Other Services

Other microservices should call this service's REST API instead of connecting directly to RabbitMQ:

```typescript
// ❌ Don't do this in each service
const connection = await amqp.connect('amqp://rabbitmq:5672');
const channel = await connection.createChannel();
await channel.sendToQueue('queue', Buffer.from(JSON.stringify(message)));

// ✅ Do this instead
await axios.post('http://message-broker-service:3016/api/messages/publish', {
  queue: 'queue',
  message: message
});
```

## Benefits

- **Centralized Management**: Single point for all queue operations
- **Simplified Services**: Other services don't need RabbitMQ client libraries
- **Connection Pooling**: Efficient connection reuse
- **Monitoring**: Centralized logging and health checks
- **Flexibility**: Easy to switch message brokers without changing other services

## Monitoring

Check service health:
```bash
curl http://localhost:3016/health
```

View RabbitMQ Management UI:
```
http://localhost:15672
Username: mallify
Password: mallify_password
```

## License

Part of the Mallify Virtual Mall platform.
