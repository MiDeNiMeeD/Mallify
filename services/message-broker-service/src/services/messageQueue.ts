import { Channel, ConsumeMessage, Options } from 'amqplib';
import RabbitMQConnection from '../config/rabbitmq';
import { createLogger } from '@mallify/shared';

const logger = createLogger('message-queue-service');

export interface PublishOptions {
  queue?: string;
  message: any;
  options?: Options.Publish;
  exchange?: string;
  routingKey?: string;
}

export interface ConsumeOptions {
  queue: string;
  callback: (message: any) => Promise<void>;
  options?: Options.Consume;
}

export interface QueueOptions {
  durable?: boolean;
  exclusive?: boolean;
  autoDelete?: boolean;
  arguments?: any;
}

export class MessageQueueService {
  private rabbitmq: RabbitMQConnection;

  constructor() {
    this.rabbitmq = RabbitMQConnection.getInstance();
  }

  /**
   * Assert a queue exists
   */
  public async assertQueue(
    queue: string,
    options: QueueOptions = { durable: true }
  ): Promise<void> {
    try {
      const channel = await this.rabbitmq.getChannel();
      await channel.assertQueue(queue, options);
      logger.info(`Queue asserted: ${queue}`);
    } catch (error) {
      logger.error(`Failed to assert queue ${queue}:`, error);
      throw error;
    }
  }

  /**
   * Publish a message to a queue
   */
  public async publishToQueue(options: PublishOptions): Promise<boolean> {
    try {
      const { queue, message, options: publishOptions } = options;
      
      if (!queue) {
        throw new Error('Queue name is required for publishing to queue');
      }
      
      // Ensure queue exists
      await this.assertQueue(queue);

      const channel = await this.rabbitmq.getChannel();
      
      // Convert message to buffer
      const messageBuffer = Buffer.from(JSON.stringify(message));
      
      const result = channel.sendToQueue(
        queue,
        messageBuffer,
        {
          persistent: true,
          ...publishOptions,
        }
      );

      if (result) {
        logger.info(`Message published to queue: ${queue}`);
      } else {
        logger.warn(`Failed to publish message to queue: ${queue} (buffer full)`);
      }

      return result;
    } catch (error) {
      logger.error('Failed to publish message:', error);
      throw error;
    }
  }

  /**
   * Publish a message to an exchange
   */
  public async publishToExchange(options: PublishOptions): Promise<boolean> {
    try {
      const { exchange, routingKey, message, options: publishOptions } = options;

      if (!exchange || !routingKey) {
        throw new Error('Exchange and routing key are required for publishing to exchange');
      }

      const channel = await this.rabbitmq.getChannel();
      
      // Assert exchange
      await channel.assertExchange(exchange, 'topic', { durable: true });

      // Convert message to buffer
      const messageBuffer = Buffer.from(JSON.stringify(message));
      
      const result = channel.publish(
        exchange,
        routingKey,
        messageBuffer,
        {
          persistent: true,
          ...publishOptions,
        }
      );

      if (result) {
        logger.info(`Message published to exchange: ${exchange} with routing key: ${routingKey}`);
      } else {
        logger.warn(`Failed to publish message to exchange: ${exchange}`);
      }

      return result;
    } catch (error) {
      logger.error('Failed to publish message to exchange:', error);
      throw error;
    }
  }

  /**
   * Consume messages from a queue
   */
  public async consumeFromQueue(options: ConsumeOptions): Promise<void> {
    try {
      const { queue, callback, options: consumeOptions } = options;
      
      // Ensure queue exists
      await this.assertQueue(queue);

      const channel = await this.rabbitmq.getChannel();

      await channel.consume(
        queue,
        async (msg: ConsumeMessage | null) => {
          if (msg) {
            try {
              const content = JSON.parse(msg.content.toString());
              logger.info(`Message received from queue: ${queue}`);
              
              // Process message with callback
              await callback(content);
              
              // Acknowledge message
              channel.ack(msg);
              logger.info(`Message acknowledged from queue: ${queue}`);
            } catch (error) {
              logger.error('Error processing message:', error);
              // Reject message and requeue
              channel.nack(msg, false, true);
            }
          }
        },
        {
          noAck: false,
          ...consumeOptions,
        }
      );

      logger.info(`Started consuming from queue: ${queue}`);
    } catch (error) {
      logger.error('Failed to consume from queue:', error);
      throw error;
    }
  }

  /**
   * Bind a queue to an exchange
   */
  public async bindQueue(
    queue: string,
    exchange: string,
    routingKey: string
  ): Promise<void> {
    try {
      const channel = await this.rabbitmq.getChannel();
      
      // Assert queue and exchange
      await this.assertQueue(queue);
      await channel.assertExchange(exchange, 'topic', { durable: true });
      
      // Bind queue to exchange
      await channel.bindQueue(queue, exchange, routingKey);
      
      logger.info(`Queue ${queue} bound to exchange ${exchange} with routing key: ${routingKey}`);
    } catch (error) {
      logger.error('Failed to bind queue:', error);
      throw error;
    }
  }

  /**
   * Delete a queue
   */
  public async deleteQueue(queue: string): Promise<void> {
    try {
      const channel = await this.rabbitmq.getChannel();
      await channel.deleteQueue(queue);
      logger.info(`Queue deleted: ${queue}`);
    } catch (error) {
      logger.error(`Failed to delete queue ${queue}:`, error);
      throw error;
    }
  }

  /**
   * Purge a queue (remove all messages)
   */
  public async purgeQueue(queue: string): Promise<void> {
    try {
      const channel = await this.rabbitmq.getChannel();
      await channel.purgeQueue(queue);
      logger.info(`Queue purged: ${queue}`);
    } catch (error) {
      logger.error(`Failed to purge queue ${queue}:`, error);
      throw error;
    }
  }

  /**
   * Get queue information
   */
  public async getQueueInfo(queue: string): Promise<any> {
    try {
      const channel = await this.rabbitmq.getChannel();
      const info = await channel.checkQueue(queue);
      return {
        queue: info.queue,
        messageCount: info.messageCount,
        consumerCount: info.consumerCount,
      };
    } catch (error) {
      logger.error(`Failed to get queue info for ${queue}:`, error);
      throw error;
    }
  }

  /**
   * Close connection
   */
  public async close(): Promise<void> {
    await this.rabbitmq.close();
  }
}

export default new MessageQueueService();
