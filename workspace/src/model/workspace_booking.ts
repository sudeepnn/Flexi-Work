import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkspaceBooking extends Document {
  workspace_id:number;  // Reference to Workspace
  user_id: string;        // Reference to User
  Booking_start_time: string;
  //Booking_end_time: string;
  floor : number;
  project : string;
}

const WorkspaceBookingSchema: Schema<IWorkspaceBooking> = new Schema({
  workspace_id: { type: Number, required: true },
  user_id: { type: String, required: true },
  Booking_start_time: { type: String, required: true },
  //Booking_end_time: { type: String, required: true },
  floor : {type: Number, required:true},
  project: {type: String}
});

export default mongoose.model<IWorkspaceBooking>('WorkspaceBooking', WorkspaceBookingSchema);
