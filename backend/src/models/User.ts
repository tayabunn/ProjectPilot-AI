import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  avatar?: string;
  role: 'admin' | 'member' | 'guest';
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, select: false },
  googleId: { type: String, sparse: true },
  avatar: { type: String },
  role: { type: String, enum: ['admin', 'member', 'guest'], default: 'member' },
  createdAt: { type: Date, default: Date.now }
});

export default model<IUser>('User', UserSchema);
