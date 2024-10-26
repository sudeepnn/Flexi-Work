import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  user_id: string;
  password: string;
  email: string;
  first_name: string,
  last_name : string;
  phone: number;
  address: string;
  role: string;
}

const UserSchema: Schema = new Schema({
  user_id: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  phone: { type: Number, required: true },
  address: { type: String, required: true },
  role: { type: String, required: true }
});

export default mongoose.model<IUser>('User', UserSchema);
