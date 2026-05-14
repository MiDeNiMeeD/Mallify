import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBlock extends Document {
  blockerId: Types.ObjectId;
  blockedId: Types.ObjectId;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BlockSchema = new Schema<IBlock>(
  {
    blockerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    blockedId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reason: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

BlockSchema.index({ blockerId: 1, blockedId: 1 }, { unique: true });

export default mongoose.model<IBlock>('Block', BlockSchema);
