export interface PublishMessageRequest {
  queue?: string;
  exchange?: string;
  routingKey?: string;
  message: any;
  options?: {
    persistent?: boolean;
    expiration?: string;
    priority?: number;
  };
}

export interface ConsumeMessageRequest {
  queue: string;
  callbackUrl?: string;
  options?: {
    noAck?: boolean;
    exclusive?: boolean;
    priority?: number;
  };
}

export interface BindQueueRequest {
  queue: string;
  exchange: string;
  routingKey: string;
}

export interface CreateQueueRequest {
  queue: string;
  options?: {
    durable?: boolean;
    exclusive?: boolean;
    autoDelete?: boolean;
  };
}

export interface QueueInfo {
  queue: string;
  messageCount: number;
  consumerCount: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
