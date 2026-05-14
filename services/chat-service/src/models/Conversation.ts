import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IParticipantState {
  userId: Types.ObjectId;
  unreadCount: number;
  lastReadAt?: Date;
  lastReadMessageId?: Types.ObjectId;
  isPinned: boolean;
  pinnedAt?: Date;
  isArchived: boolean;
  archivedAt?: Date;
  isMuted: boolean;
  mutedUntil?: Date | null;
  deletedAt?: Date | null;
  clearedAt?: Date | null;
}

export interface ILastMessagePreview {
  messageId: Types.ObjectId;
  senderId: Types.ObjectId;
  preview: string;
  messageType: 'text' | 'image' | 'file' | 'video' | 'audio' | 'voice' | 'location' | 'system';
  createdAt: Date;
}

export interface IConversation extends Document {
  participants: Types.ObjectId[];
  participantKey: string;
  state: IParticipantState[];
  lastMessage?: ILastMessagePreview;
  lastActivityAt: Date;
  pinnedMessageIds: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ParticipantStateSchema = new Schema<IParticipantState>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    unreadCount: { type: Number, default: 0, min: 0 },
    lastReadAt: { type: Date },
    lastReadMessageId: { type: Schema.Types.ObjectId, ref: 'Message' },
    isPinned: { type: Boolean, default: false },
    pinnedAt: { type: Date },
    isArchived: { type: Boolean, default: false },
    archivedAt: { type: Date },
    isMuted: { type: Boolean, default: false },
    mutedUntil: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
    clearedAt: { type: Date, default: null },
  },
  { _id: false }
);

const LastMessagePreviewSchema = new Schema<ILastMessagePreview>(
  {
    messageId: { type: Schema.Types.ObjectId, ref: 'Message', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    preview: { type: String, default: '' },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'video', 'audio', 'voice', 'location', 'system'],
      default: 'text',
    },
    createdAt: { type: Date, required: true },
  },
  { _id: false }
);

const ConversationSchema = new Schema<IConversation>(
  {
    participants: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      required: true,
      validate: {
        validator: (arr: Types.ObjectId[]) => arr.length === 2,
        message: 'A direct conversation must have exactly 2 participants',
      },
    },
    participantKey: { type: String, required: true, unique: true, index: true },
    state: { type: [ParticipantStateSchema], default: [] },
    lastMessage: { type: LastMessagePreviewSchema },
    lastActivityAt: { type: Date, default: () => new Date(), index: true },
    pinnedMessageIds: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
      default: [],
    },
  },
  { timestamps: true }
);

ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ 'state.userId': 1, lastActivityAt: -1 });

export const buildParticipantKey = (a: string, b: string): string => {
  return [a, b].sort().join(':');
};

export default mongoose.model<IConversation>('Conversation', ConversationSchema);
