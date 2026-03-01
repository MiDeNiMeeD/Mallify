import * as amqp from 'amqplib';
import { createLogger } from '@mallify/shared';

const logger = createLogger('rabbitmq-connection');

class RabbitMQConnection {
  private static instance: RabbitMQConnection;
  private connection: any = null;
  private channel: any = null;
  private isConnecting = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  private constructor() {}

  public static getInstance(): RabbitMQConnection {
    if (!RabbitMQConnection.instance) {
      RabbitMQConnection.instance = new RabbitMQConnection();
    }
    return RabbitMQConnection.instance;
  }

  public async connect(): Promise<void> {
    if (this.connection && this.channel) {
      logger.info('Already connected to RabbitMQ');
      return;
    }

    if (this.isConnecting) {
      logger.info('Connection attempt already in progress');
      return;
    }

    this.isConnecting = true;

    try {
      const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
      
      logger.info('Connecting to RabbitMQ...', { url: rabbitmqUrl.replace(/\/\/.*@/, '//*****@') });
      
      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();

      // Set prefetch to process one message at a time
      await this.channel.prefetch(1);

      logger.info('Successfully connected to RabbitMQ');

      // Handle connection close
      this.connection.on('close', () => {
        logger.warn('RabbitMQ connection closed. Attempting to reconnect...');
        this.connection = null;
        this.channel = null;
        this.scheduleReconnect();
      });

      // Handle connection error
      this.connection.on('error', (err: Error) => {
        logger.error('RabbitMQ connection error:', err);
        this.connection = null;
        this.channel = null;
      });

      // Handle channel close
      if (this.channel) {
        this.channel.on('close', () => {
          logger.warn('RabbitMQ channel closed');
          this.channel = null;
        });

        // Handle channel error
        this.channel.on('error', (err: Error) => {
          logger.error('RabbitMQ channel error:', err);
        });
      }

      this.isConnecting = false;
    } catch (error) {
      this.isConnecting = false;
      logger.error('Failed to connect to RabbitMQ:', error);
      this.scheduleReconnect();
      throw error;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      return;
    }

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      logger.info('Attempting to reconnect to RabbitMQ...');
      this.connect().catch((err) => {
        logger.error('Reconnection failed:', err);
      });
    }, 5000); // Retry after 5 seconds
  }

  public async getChannel(): Promise<any> {
    if (!this.channel) {
      await this.connect();
    }

    if (!this.channel) {
      throw new Error('Failed to establish RabbitMQ channel');
    }

    return this.channel;
  }

  public async close(): Promise<void> {
    try {
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }

      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }

      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }

      logger.info('RabbitMQ connection closed successfully');
    } catch (error) {
      logger.error('Error closing RabbitMQ connection:', error);
      throw error;
    }
  }

  public isConnected(): boolean {
    return this.connection !== null && this.channel !== null;
  }
}

export default RabbitMQConnection;
