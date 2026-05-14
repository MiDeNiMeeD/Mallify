import mongoose, { Schema, Document, Types } from 'mongoose';

export type MessageType =
  | 'text'
  | 'image'
  | 'file'
  | 'video'
  | 'audio'
  | 'voice'
  | 'location'
  | 'system';

export interface IAttachment {
  url: string;
  mimeType: string;
  name: string;
  size: number;
  width?: number;
  height?: number;
  durationMs?: number;
  thumbnailUrl?: string;
}

export interface IReaction {
  userId: Types.ObjectId;
  emoji: string;
  reactedAt: Date;
}

export interface IReadReceipt {
  userId: Types.ObjectId;
  readAt: Date;
}

export interface IDeliveryReceipt {
  userId: Types.ObjectId;
  deliveredAt: Date;
}

export interface IEditHistoryEntry {
  content: string;
  editedAt: Date;
}

export interface IForwardedFrom {
  messageId: Types.ObjectId;
  conversationId: Types.ObjectId;
  originalSenderId: Types.ObjectId;
}

export interface IMessage extends Document {
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  messageType: MessageType;
  content: string;
  attachments: IAttachment[];
  replyTo?: Types.ObjectId | null;
  forwardedFrom?: IForwardedFrom | null;
  reactions: IReaction[];
  readBy: IReadReceipt[];
  deliveredTo: IDeliveryReceipt[];
  deletedFor: Types.ObjectId[];
  isDeletedForEveryone: boolean;
  isEdited: boolean;
  editHistory: IEditHistoryEntry[];
  isPinned: boolean;
  pinnedAt?: Date | null;
  pinnedBy?: Types.ObjectId | null;
  metadata: Record<string, any>;
  clientMessageId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema = new Schema<IAttachment>(
  {
    url: { type: String, required: true },
    mimeType: { type: String, required: true },
    name: { type: String, required: true },
    size: { type: Number, required: true },
    width: { type: Number },
    height: { type: Number },
    durationMs: { type: Number },
    thumbnailUrl: { type: String },
  },
  { _id: false }
);

const ReactionSchema = new Schema<IReaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    emoji: { type: String, required: true },
    reactedAt: { type: Date, default: () => new Date() },
  },
  { _id: false }
);

const ReadReceiptSchema = new Schema<IReadReceipt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    readAt: { type: Date, default: () => new Date() },
  },
  { _id: false }
);

const DeliveryReceiptSchema = new Schema<IDeliveryReceipt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deliveredAt: { type: Date, default: () => new Date() },
  },
  { _id: false }
);

const EditHistorySchema = new Schema<IEditHistoryEntry>(
  {
    content: { type: String, required: true },
    editedAt: { type: Date, default: () => new Date() },
  },
  { _id: false }
);

const ForwardedFromSchema = new Schema<IForwardedFrom>(
  {
    messageId: { type: Schema.Types.ObjectId, ref: 'Message', required: true },
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    originalSenderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { _id: false }
);

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    messageType: {
      type: String,
      required: true,
      enum: ['text', 'image', 'file', 'video', 'audio', 'voice', 'location', 'system'],
      default: 'text',
    },
    content: { type: String, default: '' },
    attachments: { type: [AttachmentSchema], default: [] },
    replyTo: { type: Schema.Types.ObjectId, ref: 'Message', default: null },
    forwardedFrom: { type: ForwardedFromSchema, default: null },
    reactions: { type: [ReactionSchema], default: [] },
    readBy: { type: [ReadReceiptSchema], default: [] },
    deliveredTo: { type: [DeliveryReceiptSchema], default: [] },
    deletedFor: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
    isDeletedForEveryone: { type: Boolean, default: false, index: true },
    isEdited: { type: Boolean, default: false },
    editHistory: { type: [EditHistorySchema], default: [] },
    isPinned: { type: Boolean, default: false, index: true },
    pinnedAt: { type: Date, default: null },
    pinnedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
    clientMessageId: { type: String, index: true, sparse: true },
  },
  { timestamps: true }
);

MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ conversationId: 1, isPinned: 1 });
MessageSchema.index({ content: 'text' });

export default mongoose.model<IMessage>('Message', MessageSchema);
