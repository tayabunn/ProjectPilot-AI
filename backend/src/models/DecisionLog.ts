import { Schema, model, Document, Types } from 'mongoose';

export interface IDecisionLog extends Document {
  projectId: Types.ObjectId;
  title: string;
  category: 'architecture' | 'prioritization' | 'timeline' | 'risk' | 'scope';
  reason: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
}

const DecisionLogSchema = new Schema<IDecisionLog>({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['architecture', 'prioritization', 'timeline', 'risk', 'scope'],
    default: 'prioritization' 
  },
  reason: { type: String, required: true },
  confidence: { type: Number, default: 90 },
  impact: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  timestamp: { type: Date, default: Date.now }
});

export default model<IDecisionLog>('DecisionLog', DecisionLogSchema);
