import mongoose, { Schema, Document } from 'mongoose';

export interface IUserMemory extends Document {
  userId: mongoose.Types.ObjectId;
  preferences: {
    category: string;
    value: string;
    usageCount: number;
    lastUsed: Date;
    confidence: number;
  }[];
  projectHistory: {
    projectId: mongoose.Types.ObjectId;
    projectName: string;
    techStack: string[];
    createdAt: Date;
  }[];
  lastUpdated: Date;
}

const UserMemorySchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    preferences: [
      {
        category: { type: String, required: true },
        value: { type: String, required: true },
        usageCount: { type: Number, default: 1 },
        lastUsed: { type: Date, default: Date.now },
        confidence: { type: Number, default: 80 }
      }
    ],
    projectHistory: [
      {
        projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
        projectName: { type: String },
        techStack: [{ type: String }],
        createdAt: { type: Date, default: Date.now }
      }
    ],
    lastUpdated: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model<IUserMemory>('UserMemory', UserMemorySchema);
