import mongoose, { Schema, Document } from 'mongoose';

export interface IMeetingNote extends Document {
  projectId: mongoose.Types.ObjectId;
  title: string;
  rawTranscript: string;
  extractedData: {
    decisions: { text: string; owner?: string }[];
    actionItems: { text: string; owner?: string; priority?: string; dueDate?: string }[];
    risks: { text: string; severity?: string }[];
    owners: string[];
  };
  createdAt: Date;
}

const MeetingNoteSchema: Schema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    title: { type: String, required: true },
    rawTranscript: { type: String, required: true },
    extractedData: {
      decisions: [{ text: String, owner: String }],
      actionItems: [{ text: String, owner: String, priority: String, dueDate: String }],
      risks: [{ text: String, severity: String }],
      owners: [{ type: String }]
    },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model<IMeetingNote>('MeetingNote', MeetingNoteSchema);
