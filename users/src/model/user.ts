import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  user_id: string;
  password: string;
  email: string;
  name: string;
  phone: number;
  address: string;
  role: string;
  isOndcMember?: boolean;
  project?: string|null;
}

const UserSchema: Schema = new Schema({
  user_id: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: Number, required: true },
  address: { type: String, required: true },
  role: { type: String, required: true },
  isOndcMember: { type: Boolean, default: false },
  project: { type: String, default: null }
});

export default mongoose.model<IUser>('User', UserSchema);
