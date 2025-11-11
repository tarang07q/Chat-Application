import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  _id: mongoose.Types.ObjectId;
  type: 'private' | 'group';
  participants: mongoose.Types.ObjectId[];
  groupName?: string;
  groupAvatar?: string;
  admins: mongoose.Types.ObjectId[];
  lastMessage?: mongoose.Types.ObjectId;
  lastMessageAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    type: {
      type: String,
      enum: ['private', 'group'],
      required: true,
    },
    participants: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }],
    groupName: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    groupAvatar: {
      type: String,
    },
    admins: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
    lastMessageAt: {
      type: Date,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
conversationSchema.index({ participants: 1 });
conversationSchema.index({ type: 1 });
conversationSchema.index({ lastMessageAt: -1 });

// Validate group conversations
conversationSchema.pre('save', function(next) {
  if (this.type === 'group') {
    if (!this.groupName) {
      return next(new Error('Group name is required for group conversations'));
    }
    if (this.participants.length < 2) {
      return next(new Error('Group must have at least 2 participants'));
    }
    if (!this.admins || this.admins.length === 0) {
      this.admins = [this.createdBy];
    }
  } else if (this.type === 'private') {
    if (this.participants.length !== 2) {
      return next(new Error('Private conversation must have exactly 2 participants'));
    }
  }
  next();
});

export const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);
