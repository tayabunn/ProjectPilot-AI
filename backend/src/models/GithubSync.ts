import mongoose, { Schema, Document } from 'mongoose';

export interface IGithubCommit {
  hash: string;
  message: string;
  author: string;
  avatarUrl?: string;
  branch: string;
  timestamp: Date;
}

export interface IGithubPullRequest {
  id: string;
  number: number;
  title: string;
  author: string;
  avatarUrl?: string;
  status: 'open' | 'merged' | 'closed';
  targetBranch: string;
  sourceBranch: string;
  additions: number;
  deletions: number;
  reviewers: string[];
  createdAt: Date;
  mergedAt?: Date;
  isReviewRequested?: boolean;
}

export interface IGithubIssue {
  id: string;
  number: number;
  title: string;
  state: 'open' | 'closed';
  author: string;
  labels: string[];
  createdAt: Date;
}

export interface IGithubSync extends Document {
  projectId: mongoose.Types.ObjectId;
  repoName: string;
  repoUrl: string;
  lastSyncedAt: Date;
  commits: IGithubCommit[];
  pullRequests: IGithubPullRequest[];
  issues: IGithubIssue[];
  branches: string[];
}

const GithubSyncSchema: Schema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    repoName: { type: String, required: true },
    repoUrl: { type: String, required: true },
    lastSyncedAt: { type: Date, default: Date.now },
    commits: [
      {
        hash: { type: String, required: true },
        message: { type: String, required: true },
        author: { type: String, required: true },
        avatarUrl: String,
        branch: { type: String, default: 'main' },
        timestamp: { type: Date, default: Date.now }
      }
    ],
    pullRequests: [
      {
        id: { type: String, required: true },
        number: { type: Number, required: true },
        title: { type: String, required: true },
        author: { type: String, required: true },
        avatarUrl: String,
        status: { type: String, enum: ['open', 'merged', 'closed'], default: 'open' },
        targetBranch: { type: String, default: 'main' },
        sourceBranch: { type: String, required: true },
        additions: { type: Number, default: 0 },
        deletions: { type: Number, default: 0 },
        reviewers: [{ type: String }],
        createdAt: { type: Date, default: Date.now },
        mergedAt: Date,
        isReviewRequested: { type: Boolean, default: false }
      }
    ],
    issues: [
      {
        id: { type: String, required: true },
        number: { type: Number, required: true },
        title: { type: String, required: true },
        state: { type: String, enum: ['open', 'closed'], default: 'open' },
        author: { type: String, required: true },
        labels: [{ type: String }],
        createdAt: { type: Date, default: Date.now }
      }
    ],
    branches: [{ type: String }]
  },
  { timestamps: true }
);

export default mongoose.model<IGithubSync>('GithubSync', GithubSyncSchema);
