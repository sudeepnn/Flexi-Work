import mongoose, { Document, Schema } from "mongoose";

export interface IEventRegistration extends Document {
  event_name: string;
  user_id: string;
}

const EventRegistrationSchema: Schema = new Schema({
  event_name: { type: String ,required: true },
  user_id: { type: String, required: true},
});

export default mongoose.model<IEventRegistration>("EventRegistration", EventRegistrationSchema);
