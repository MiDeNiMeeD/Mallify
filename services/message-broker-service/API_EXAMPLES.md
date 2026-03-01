# Message Broker Service - API Examples

This document provides practical examples for using the Message Broker Service API.

## Base URL

```
Local: http://localhost:3016
Docker: http://message-broker-service:3016
```

## Example Use Cases

### 1. Order Processing Flow

#### Step 1: Create Order Queue

```bash
curl -X POST http://localhost:3016/api/messages/queue \
  -H "Content-Type: application/json" \
  -d '{
    "queue": "order-processing",
    "options": {
      "durable": true
    }
  }'
```

#### Step 2: Publish Order Created Event

```bash
curl -X POST http://localhost:3016/api/messages/publish \
  -H "Content-Type: application/json" \
  -d '{
    "queue": "order-processing",
    "message": {
      "event": "order.created",
      "orderId": "ORD-12345",
      "customerId": "CUST-67890",
      "items": [
        {
          "productId": "PROD-001",
          "quantity": 2,
          "price": 29.99
        }
      ],
      "totalAmount": 59.98,
      "timestamp": "2024-01-20T10:30:00.000Z"
    }
  }'
```

#### Step 3: Check Queue Status

```bash
curl http://localhost:3016/api/messages/queue/order-processing
```

### 2. Notification System with Exchange

#### Step 1: Create Notification Exchange and Queues

```bash
# Create email notification queue
curl -X POST http://localhost:3016/api/messages/queue \
  -H "Content-Type: application/json" \
  -d '{
    "queue": "email-notifications",
    "options": {
      "durable": true
    }
  }'

# Create SMS notification queue
curl -X POST http://localhost:3016/api/messages/queue \
  -H "Content-Type: application/json" \
  -d '{
    "queue": "sms-notifications",
    "options": {
      "durable": true
    }
  }'

# Create push notification queue
curl -X POST http://localhost:3016/api/messages/queue \
  -H "Content-Type: application/json" \
  -d '{
    "queue": "push-notifications",
    "options": {
      "durable": true
    }
  }'
```

#### Step 2: Bind Queues to Exchange

```bash
# Bind email queue
curl -X POST http://localhost:3016/api/messages/bind \
  -H "Content-Type: application/json" \
  -d '{
    "queue": "email-notifications",
    "exchange": "notifications",
    "routingKey": "notification.email.*"
  }'

# Bind SMS queue
curl -X POST http://localhost:3016/api/messages/bind \
  -H "Content-Type: application/json" \
  -d '{
    "queue": "sms-notifications",
    "exchange": "notifications",
    "routingKey": "notification.sms.*"
  }'

# Bind push queue
curl -X POST http://localhost:3016/api/messages/bind \
  -H "Content-Type: application/json" \
  -d '{
    "queue": "push-notifications",
    "exchange": "notifications",
    "routingKey": "notification.push.*"
  }'
```

#### Step 3: Publish Notification via Exchange

```bash
# Send email notification
curl -X POST http://localhost:3016/api/messages/publish \
  -H "Content-Type: application/json" \
  -d '{
    "exchange": "notifications",
    "routingKey": "notification.email.order-confirmation",
    "message": {
      "recipientEmail": "customer@example.com",
      "subject": "Order Confirmation",
      "templateId": "order-confirmation",
      "data": {
        "orderId": "ORD-12345",
        "customerName": "John Doe",
        "orderTotal": 59.98
      }
    }
  }'

# Send SMS notification
curl -X POST http://localhost:3016/api/messages/publish \
  -H "Content-Type: application/json" \
  -d '{
    "exchange": "notifications",
    "routingKey": "notification.sms.delivery-update",
    "message": {
      "phone": "+1234567890",
      "message": "Your order ORD-12345 is out for delivery"
    }
  }'
```

### 3. Payment Processing

```bash
# Create payment queue
curl -X POST http://localhost:3016/api/messages/queue \
  -H "Content-Type: application/json" \
  -d '{
    "queue": "payment-processing",
    "options": {
      "durable": true
    }
  }'

# Publish payment request
curl -X POST http://localhost:3016/api/messages/publish \
  -H "Content-Type: application/json" \
  -d '{
    "queue": "payment-processing",
    "message": {
      "event": "payment.initiated",
      "paymentId": "PAY-12345",
      "orderId": "ORD-12345",
      "amount": 59.98,
      "currency": "USD",
      "paymentMethod": "credit_card",
      "customerId": "CUST-67890"
    },
    "options": {
      "persistent": true,
      "expiration": "300000"
    }
  }'
```

### 4. Driver Assignment (Delivery Service)

```bash
# Create driver assignment queue
curl -X POST http://localhost:3016/api/messages/queue \
  -H "Content-Type: application/json" \
  -d '{
    "queue": "driver-assignment",
    "options": {
      "durable": true
    }
  }'

# Publish driver assignment request
curl -X POST http://localhost:3016/api/messages/publish \
  -H "Content-Type: application/json" \
  -d '{
    "queue": "driver-assignment",
    "message": {
      "event": "delivery.assign-driver",
      "deliveryId": "DEL-12345",
      "orderId": "ORD-12345",
      "pickupLocation": {
        "lat": 40.7128,
        "lng": -74.0060,
        "address": "123 Store St, New York, NY"
      },
      "deliveryLocation": {
        "lat": 40.7589,
        "lng": -73.9851,
        "address": "456 Customer Ave, New York, NY"
      },
      "priority": "high",
      "estimatedDistance": 5.2
    }
  }'
```

### 5. Inventory Management

```bash
# Create inventory update queue
curl -X POST http://localhost:3016/api/messages/queue \
  -H "Content-Type: application/json" \
  -d '{
    "queue": "inventory-updates",
    "options": {
      "durable": true
    }
  }'

# Publish stock update
curl -X POST http://localhost:3016/api/messages/publish \
  -H "Content-Type: application/json" \
  -d '{
    "queue": "inventory-updates",
    "message": {
      "event": "inventory.stock-update",
      "productId": "PROD-001",
      "boutiqueId": "BTQ-123",
      "previousStock": 100,
      "newStock": 98,
      "delta": -2,
      "reason": "order_placed",
      "orderId": "ORD-12345",
      "timestamp": "2024-01-20T10:30:00.000Z"
    }
  }'
```

## Queue Management Operations

### List Queue Information

```bash
curl http://localhost:3016/api/messages/queue/order-processing
```

**Response:**
```json
{
  "success": true,
  "data": {
    "queue": "order-processing",
    "messageCount": 5,
    "consumerCount": 2
  }
}
```

### Purge Queue

```bash
curl -X POST http://localhost:3016/api/messages/queue/order-processing/purge
```

### Delete Queue

```bash
curl -X DELETE http://localhost:3016/api/messages/queue/order-processing
```

## Health Checks

### Service Health

```bash
curl http://localhost:3016/health
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

### API Health

```bash
curl http://localhost:3016/api/messages/health
```

## Integration Examples

### Node.js/TypeScript Service Integration

```typescript
import axios from 'axios';

const MESSAGE_BROKER_URL = process.env.MESSAGE_BROKER_URL || 'http://message-broker-service:3016';

// Message Broker Client Class
class MessageBrokerClient {
  private baseUrl: string;

  constructor(baseUrl: string = MESSAGE_BROKER_URL) {
    this.baseUrl = baseUrl;
  }

  async publishToQueue(queue: string, message: any, options?: any) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/messages/publish`, {
        queue,
        message,
        options
      });
      return response.data;
    } catch (error) {
      console.error('Failed to publish message:', error);
      throw error;
    }
  }

  async publishToExchange(exchange: string, routingKey: string, message: any) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/messages/publish`, {
        exchange,
        routingKey,
        message
      });
      return response.data;
    } catch (error) {
      console.error('Failed to publish message:', error);
      throw error;
    }
  }

  async createQueue(queue: string, options?: any) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/messages/queue`, {
        queue,
        options
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create queue:', error);
      throw error;
    }
  }

  async getQueueInfo(queue: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/messages/queue/${queue}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get queue info:', error);
      throw error;
    }
  }

  async bindQueue(queue: string, exchange: string, routingKey: string) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/messages/bind`, {
        queue,
        exchange,
        routingKey
      });
      return response.data;
    } catch (error) {
      console.error('Failed to bind queue:', error);
      throw error;
    }
  }
}

// Usage Examples
const messageBroker = new MessageBrokerClient();

// Example 1: Order Service - Publish order created event
async function publishOrderCreated(orderId: string, orderData: any) {
  await messageBroker.publishToQueue('order-processing', {
    event: 'order.created',
    orderId,
    ...orderData,
    timestamp: new Date().toISOString()
  });
}

// Example 2: Notification Service - Send notification
async function sendNotification(type: 'email' | 'sms' | 'push', data: any) {
  await messageBroker.publishToExchange(
    'notifications',
    `notification.${type}.${data.event}`,
    data
  );
}

// Example 3: Setup Order Processing Workflow
async function setupOrderWorkflow() {
  // Create queues
  await messageBroker.createQueue('order-processing', { durable: true });
  await messageBroker.createQueue('payment-processing', { durable: true });
  await messageBroker.createQueue('inventory-updates', { durable: true });
  
  // Bind to exchanges
  await messageBroker.bindQueue('order-processing', 'orders', 'order.*');
  await messageBroker.bindQueue('payment-processing', 'payments', 'payment.*');
}

export { MessageBrokerClient, messageBroker };
```

### Python Service Integration

```python
import requests
import json
from typing import Any, Dict, Optional

class MessageBrokerClient:
    def __init__(self, base_url: str = "http://message-broker-service:3016"):
        self.base_url = base_url
    
    def publish_to_queue(self, queue: str, message: Any, options: Optional[Dict] = None) -> Dict:
        """Publish a message to a queue"""
        url = f"{self.base_url}/api/messages/publish"
        payload = {
            "queue": queue,
            "message": message
        }
        if options:
            payload["options"] = options
        
        response = requests.post(url, json=payload)
        response.raise_for_status()
        return response.json()
    
    def publish_to_exchange(self, exchange: str, routing_key: str, message: Any) -> Dict:
        """Publish a message to an exchange"""
        url = f"{self.base_url}/api/messages/publish"
        payload = {
            "exchange": exchange,
            "routingKey": routing_key,
            "message": message
        }
        
        response = requests.post(url, json=payload)
        response.raise_for_status()
        return response.json()
    
    def create_queue(self, queue: str, options: Optional[Dict] = None) -> Dict:
        """Create a new queue"""
        url = f"{self.base_url}/api/messages/queue"
        payload = {"queue": queue}
        if options:
            payload["options"] = options
        
        response = requests.post(url, json=payload)
        response.raise_for_status()
        return response.json()
    
    def get_queue_info(self, queue: str) -> Dict:
        """Get queue information"""
        url = f"{self.base_url}/api/messages/queue/{queue}"
        response = requests.get(url)
        response.raise_for_status()
        return response.json()

# Usage
broker = MessageBrokerClient()

# Publish order event
broker.publish_to_queue("order-processing", {
    "event": "order.created",
    "orderId": "ORD-12345",
    "customerId": "CUST-67890",
    "amount": 59.98
})
```

## Common Queue Patterns

### 1. Task Queue (Work Distribution)

```bash
# Workers pull tasks from queue
curl -X POST http://localhost:3016/api/messages/queue \
  -H "Content-Type: application/json" \
  -d '{
    "queue": "image-processing-tasks",
    "options": {
      "durable": true
    }
  }'

# Publish task
curl -X POST http://localhost:3016/api/messages/publish \
  -H "Content-Type: application/json" \
  -d '{
    "queue": "image-processing-tasks",
    "message": {
      "taskId": "TASK-123",
      "imageUrl": "https://example.com/image.jpg",
      "operations": ["resize", "watermark", "compress"]
    }
  }'
```

### 2. Pub/Sub Pattern (Fanout)

```bash
# Create multiple subscriber queues
curl -X POST http://localhost:3016/api/messages/queue \
  -H "Content-Type: application/json" \
  -d '{"queue": "analytics-subscriber", "options": {"durable": true}}'

curl -X POST http://localhost:3016/api/messages/queue \
  -H "Content-Type: application/json" \
  -d '{"queue": "logging-subscriber", "options": {"durable": true}}'

curl -X POST http://localhost:3016/api/messages/queue \
  -H "Content-Type: application/json" \
  -d '{"queue": "audit-subscriber", "options": {"durable": true}}'

# Bind all to same exchange/routing key
curl -X POST http://localhost:3016/api/messages/bind \
  -H "Content-Type: application/json" \
  -d '{"queue": "analytics-subscriber", "exchange": "events", "routingKey": "user.*"}'

curl -X POST http://localhost:3016/api/messages/bind \
  -H "Content-Type: application/json" \
  -d '{"queue": "logging-subscriber", "exchange": "events", "routingKey": "user.*"}'

curl -X POST http://localhost:3016/api/messages/bind \
  -H "Content-Type: application/json" \
  -d '{"queue": "audit-subscriber", "exchange": "events", "routingKey": "user.*"}'

# Publish event (all subscribers receive it)
curl -X POST http://localhost:3016/api/messages/publish \
  -H "Content-Type: application/json" \
  -d '{
    "exchange": "events",
    "routingKey": "user.login",
    "message": {
      "userId": "USER-123",
      "timestamp": "2024-01-20T10:30:00.000Z",
      "ipAddress": "192.168.1.1"
    }
  }'
```

### 3. Priority Queue

```bash
# Publish high priority message
curl -X POST http://localhost:3016/api/messages/publish \
  -H "Content-Type: application/json" \
  -d '{
    "queue": "order-processing",
    "message": {
      "orderId": "ORD-URGENT-001",
      "priority": "high"
    },
    "options": {
      "priority": 10
    }
  }'

# Publish normal priority message
curl -X POST http://localhost:3016/api/messages/publish \
  -H "Content-Type: application/json" \
  -d '{
    "queue": "order-processing",
    "message": {
      "orderId": "ORD-NORMAL-001",
      "priority": "normal"
    },
    "options": {
      "priority": 5
    }
  }'
```

## Error Handling

### Common Error Responses

```json
{
  "success": false,
  "error": "Queue name is required"
}
```

```json
{
  "success": false,
  "error": "Either queue or (exchange + routingKey) must be provided"
}
```

```json
{
  "success": false,
  "error": "Failed to connect to RabbitMQ"
}
```

## Testing

Run these commands to verify your setup:

```bash
# 1. Check service health
curl http://localhost:3016/health

# 2. Create test queue
curl -X POST http://localhost:3016/api/messages/queue \
  -H "Content-Type: application/json" \
  -d '{"queue": "test-queue"}'

# 3. Publish test message
curl -X POST http://localhost:3016/api/messages/publish \
  -H "Content-Type: application/json" \
  -d '{
    "queue": "test-queue",
    "message": {"test": "Hello World"}
  }'

# 4. Check queue status
curl http://localhost:3016/api/messages/queue/test-queue

# 5. Purge queue
curl -X POST http://localhost:3016/api/messages/queue/test-queue/purge

# 6. Delete queue
curl -X DELETE http://localhost:3016/api/messages/queue/test-queue
```
