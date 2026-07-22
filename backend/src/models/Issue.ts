import { Schema, model, Document, Types } from 'mongoose';

export interface IIssue extends Document {
  projectId: Types.ObjectId;
  title: string;
  description?: string;
  status: 'open' | 'closed';
  createdAt: Date;
}

const IssueSchema = new Schema<IIssue>({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  createdAt: { type: Date, default: Date.now }
});

export default model<IIssue>('Issue', IssueSchema);
