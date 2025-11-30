const amqp = require("amqplib");

class MessageBroker {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.exchanges = {
      ORDERS: "orders",
      PAYMENTS: "payments",
      NOTIFICATIONS: "notifications",
      ANALYTICS: "analytics",
      DELIVERIES: "deliveries",
      USERS: "users",
      BOUTIQUES: "boutiques",
    };
  }

  /**
   * Connect to RabbitMQ
   */
  async connect() {
    try {
      const url =
        process.env.RABBITMQ_URL || "amqp://admin:admin123@localhost:5672";
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();

      // Declare exchanges
      for (const exchange of Object.values(this.exchanges)) {
        await this.channel.assertExchange(exchange, "topic", { durable: true });
      }

      console.log("Connected to RabbitMQ");

      // Handle connection close
      this.connection.on("close", () => {
        console.error("RabbitMQ connection closed, reconnecting...");
        setTimeout(() => this.connect(), 5000);
      });

      // Handle connection error
      this.connection.on("error", (err) => {
        console.error("RabbitMQ connection error:", err);
      });

      return this.channel;
    } catch (error) {
      console.error("Failed to connect to RabbitMQ:", error);
      setTimeout(() => this.connect(), 5000);
    }
  }

  /**
   * Publish a message to an exchange
   */
  async publish(exchange, routingKey, message) {
    try {
      if (!this.channel) {
        await this.connect();
      }

      const content = Buffer.from(JSON.stringify(message));

      this.channel.publish(exchange, routingKey, content, {
        persistent: true,
        contentType: "application/json",
        timestamp: Date.now(),
      });

      console.log(`Published message to ${exchange}.${routingKey}`);
    } catch (error) {
      console.error("Failed to publish message:", error);
      throw error;
    }
  }

  /**
   * Subscribe to messages from a queue
   */
  async subscribe(exchange, routingKey, queueName, callback) {
    try {
      if (!this.channel) {
        await this.connect();
      }

      // Assert queue
      await this.channel.assertQueue(queueName, { durable: true });

      // Bind queue to exchange
      await this.channel.bindQueue(queueName, exchange, routingKey);

      // Set prefetch to 1 to distribute load evenly
      await this.channel.prefetch(1);

      // Consume messages
      this.channel.consume(queueName, async (msg) => {
        if (msg) {
          try {
            const content = JSON.parse(msg.content.toString());
            await callback(content, msg);
            this.channel.ack(msg);
          } catch (error) {
            console.error("Error processing message:", error);
            // Reject and requeue the message
            this.channel.nack(msg, false, true);
          }
        }
      });

      console.log(
        `Subscribed to ${exchange}.${routingKey} on queue ${queueName}`
      );
    } catch (error) {
      console.error("Failed to subscribe:", error);
      throw error;
    }
  }

  /**
   * Close the connection
   */
  async close() {
    try {
      await this.channel?.close();
      await this.connection?.close();
      console.log("RabbitMQ connection closed");
    } catch (error) {
      console.error("Error closing RabbitMQ connection:", error);
    }
  }
}

// Singleton instance
const messageBroker = new MessageBroker();

module.exports = messageBroker;
