import { getChannel, CHAT_EXCHANGE, CHAT_QUEUES, NOTIFICATION_QUEUE } from '../config/rabbitmq';

const publish = (routingKey: string, payload: any): void => {
  const channel = getChannel();
  if (!channel) return;
  try {
    const buffer = Buffer.from(JSON.stringify(payload));
    channel.publish(CHAT_EXCHANGE, routingKey, buffer, { persistent: true });
  } catch (err) {
    console.error('Chat Service: failed to publish event', routingKey, err);
  }
};

const sendToQueue = (queue: string, payload: any): void => {
  const channel = getChannel();
  if (!channel) return;
  try {
    const buffer = Buffer.from(JSON.stringify(payload));
    channel.sendToQueue(queue, buffer, { persistent: true });
  } catch (err) {
    console.error('Chat Service: failed to send to queue', queue, err);
  }
};

export const emitMessageCreated = (payload: {
  messageId: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  preview: string;
  messageType: string;
  createdAt: Date;
}): void => {
  publish(CHAT_QUEUES.MESSAGE_CREATED, payload);
  sendToQueue(NOTIFICATION_QUEUE, {
    type: 'chat',
    userId: payload.receiverId,
    title: 'New message',
    body: payload.preview,
    data: {
      kind: 'chat.message.created',
      conversationId: payload.conversationId,
      messageId: payload.messageId,
      senderId: payload.senderId,
    },
    createdAt: payload.createdAt,
  });
};

export const emitMessageRead = (payload: {
  conversationId: string;
  readerId: string;
  messageIds: string[];
  readAt: Date;
}): void => {
  publish(CHAT_QUEUES.MESSAGE_READ, payload);
};

export const emitMessageDeleted = (payload: {
  conversationId: string;
  messageId: string;
  deletedBy: string;
  scope: 'me' | 'everyone';
}): void => {
  publish(CHAT_QUEUES.MESSAGE_DELETED, payload);
};

export const emitConversationCreated = (payload: {
  conversationId: string;
  participants: string[];
  createdBy: string;
}): void => {
  publish(CHAT_QUEUES.CONVERSATION_CREATED, payload);
};
