import mongoose, { Document, Schema } from 'mongoose';

interface Booking {
  userId: string; 
  name : string;
  contact: number;
  startTime: Date; 
}


export interface IWorkspace extends Document {
  workspace_id : string
  project: string;
  floor: number;
  availability: boolean;
  bookings?: Booking[]; 
}

const bookingSchema = new Schema<Booking>({
  userId: { type: String, required: true }, 
  name:{type: String, required: true},
  contact: { type: Number, required: true },
  startTime: { type: Date, required: true },
  
});

const WorkspaceSchema: Schema<IWorkspace> = new Schema({
  workspace_id : {type: String, required: true},
  project: { type: String, required: true },
  floor: { type: Number, required: true },
  //location: { type: String, required: true },
  availability: { type: Boolean, default: true },
  bookings: { type: [bookingSchema], default: [] }
});

export default mongoose.model<IWorkspace>('Workspace', WorkspaceSchema);
