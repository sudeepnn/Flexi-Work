import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkspaceBooking extends Document {
  workspace_id: mongoose.Types.ObjectId;  // Reference to Workspace
  user_id: mongoose.Types.ObjectId;        // Reference to User
  ondc: boolean;
  project: string;
  Booking_start_time: string;
  Booking_end_time: string;
}

const WorkspaceBookingSchema: Schema<IWorkspaceBooking> = new Schema({
  workspace_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ondc: { type: Boolean, default: false },
  project: { type: String },
  Booking_start_time: { type: String, required: true },
  Booking_end_time: { type: String, required: true },
});

export default mongoose.model<IWorkspaceBooking>('WorkspaceBooking', WorkspaceBookingSchema);
