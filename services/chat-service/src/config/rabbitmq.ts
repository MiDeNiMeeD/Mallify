import amqp from 'amqplib';

let connection: any = null;
let channel: any = null;
let connecting: Promise<void> | null = null;

export const CHAT_EXCHANGE = 'chat.events';

export const CHAT_QUEUES = {
  MESSAGE_CREATED: 'chat.message.created',
  MESSAGE_READ: 'chat.message.read',
  MESSAGE_DELETED: 'chat.message.deleted',
  CONVERSATION_CREATED: 'chat.conversation.created',
} as const;

export const NOTIFICATION_QUEUE = 'notification.send';

const connectRabbit = async (): Promise<void> => {
  const url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
  connection = await amqp.connect(url);
  channel = await connection.createChannel();

  await channel.assertExchange(CHAT_EXCHANGE, 'topic', { durable: true });
  for (const queue of Object.values(CHAT_QUEUES)) {
    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, CHAT_EXCHANGE, queue);
  }
  await channel.assertQueue(NOTIFICATION_QUEUE, { durable: true });

  connection.on('error', (err: any) => console.error('Chat Service: RabbitMQ connection error', err));
  connection.on('close', () => {
    console.warn('Chat Service: RabbitMQ connection closed, will reconnect');
    connection = null;
    channel = null;
  });

  console.log('Chat Service: RabbitMQ connected');
};

export const initRabbit = async (): Promise<void> => {
  if (connection && channel) return;
  if (!connecting) {
    connecting = connectRabbit().finally(() => {
      connecting = null;
    });
  }
  try {
    await connecting;
  } catch (err) {
    console.error('Chat Service: RabbitMQ init failed, continuing without queue', err);
  }
};

export const getChannel = (): any => channel;

export const closeRabbit = async (): Promise<void> => {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
  } catch (err) {
    console.error('Chat Service: RabbitMQ close error', err);
  } finally {
    channel = null;
    connection = null;
  }
};
