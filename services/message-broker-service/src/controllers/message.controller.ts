import { Request, Response } from 'express';
import messageQueueService from '../services/messageQueue';
import { createLogger } from '@mallify/shared';
import {
  PublishMessageRequest,
  CreateQueueRequest,
  BindQueueRequest,
  ApiResponse,
} from '../types';

const logger = createLogger('message-controller');

export class MessageController {
  /**
   * Publish a message to a queue or exchange
   */
  public async publishMessage(req: Request, res: Response): Promise<void> {
    try {
      const body: PublishMessageRequest = req.body;

      // Validate request
      if (!body.message) {
        res.status(400).json({
          success: false,
          error: 'Message is required',
        } as ApiResponse);
        return;
      }

      let result: boolean;

      // Publish to exchange or queue
      if (body.exchange && body.routingKey) {
        result = await messageQueueService.publishToExchange({
          exchange: body.exchange,
          routingKey: body.routingKey,
          message: body.message,
          options: body.options,
        });
      } else if (body.queue) {
        result = await messageQueueService.publishToQueue({
          queue: body.queue,
          message: body.message,
          options: body.options,
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Either queue or (exchange + routingKey) must be provided',
        } as ApiResponse);
        return;
      }

      res.status(200).json({
        success: true,
        data: { published: result },
        message: 'Message published successfully',
      } as ApiResponse);
    } catch (error: any) {
      logger.error('Error publishing message:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to publish message',
      } as ApiResponse);
    }
  }

  /**
   * Create a new queue
   */
  public async createQueue(req: Request, res: Response): Promise<void> {
    try {
      const body: CreateQueueRequest = req.body;

      if (!body.queue) {
        res.status(400).json({
          success: false,
          error: 'Queue name is required',
        } as ApiResponse);
        return;
      }

      await messageQueueService.assertQueue(body.queue, body.options);

      res.status(201).json({
        success: true,
        data: { queue: body.queue },
        message: 'Queue created successfully',
      } as ApiResponse);
    } catch (error: any) {
      logger.error('Error creating queue:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create queue',
      } as ApiResponse);
    }
  }

  /**
   * Bind a queue to an exchange
   */
  public async bindQueue(req: Request, res: Response): Promise<void> {
    try {
      const body: BindQueueRequest = req.body;

      if (!body.queue || !body.exchange || !body.routingKey) {
        res.status(400).json({
          success: false,
          error: 'Queue, exchange, and routingKey are required',
        } as ApiResponse);
        return;
      }

      await messageQueueService.bindQueue(
        body.queue,
        body.exchange,
        body.routingKey
      );

      res.status(200).json({
        success: true,
        message: 'Queue bound to exchange successfully',
      } as ApiResponse);
    } catch (error: any) {
      logger.error('Error binding queue:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to bind queue',
      } as ApiResponse);
    }
  }

  /**
   * Get queue information
   */
  public async getQueueInfo(req: Request, res: Response): Promise<void> {
    try {
      const { queue } = req.params;

      if (!queue) {
        res.status(400).json({
          success: false,
          error: 'Queue name is required',
        } as ApiResponse);
        return;
      }

      const info = await messageQueueService.getQueueInfo(queue);

      res.status(200).json({
        success: true,
        data: info,
      } as ApiResponse);
    } catch (error: any) {
      logger.error('Error getting queue info:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get queue info',
      } as ApiResponse);
    }
  }

  /**
   * Delete a queue
   */
  public async deleteQueue(req: Request, res: Response): Promise<void> {
    try {
      const { queue } = req.params;

      if (!queue) {
        res.status(400).json({
          success: false,
          error: 'Queue name is required',
        } as ApiResponse);
        return;
      }

      await messageQueueService.deleteQueue(queue);

      res.status(200).json({
        success: true,
        message: 'Queue deleted successfully',
      } as ApiResponse);
    } catch (error: any) {
      logger.error('Error deleting queue:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete queue',
      } as ApiResponse);
    }
  }

  /**
   * Purge a queue
   */
  public async purgeQueue(req: Request, res: Response): Promise<void> {
    try {
      const { queue } = req.params;

      if (!queue) {
        res.status(400).json({
          success: false,
          error: 'Queue name is required',
        } as ApiResponse);
        return;
      }

      await messageQueueService.purgeQueue(queue);

      res.status(200).json({
        success: true,
        message: 'Queue purged successfully',
      } as ApiResponse);
    } catch (error: any) {
      logger.error('Error purging queue:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to purge queue',
      } as ApiResponse);
    }
  }

  /**
   * Health check
   */
  public async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const rabbitmq = require('../config/rabbitmq').default;
      const isConnected = rabbitmq.getInstance().isConnected();

      res.status(isConnected ? 200 : 503).json({
        success: isConnected,
        data: {
          status: isConnected ? 'healthy' : 'unhealthy',
          service: 'message-broker-service',
          timestamp: new Date().toISOString(),
        },
      } as ApiResponse);
    } catch (error: any) {
      logger.error('Health check failed:', error);
      res.status(503).json({
        success: false,
        error: error.message || 'Health check failed',
      } as ApiResponse);
    }
  }
}

export default new MessageController();
