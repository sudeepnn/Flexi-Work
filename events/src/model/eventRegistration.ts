import mongoose, { Document, Schema } from "mongoose";

export interface IEventRegistration extends Document {
  event_id: number;
  user_id: number;
}

const EventRegistrationSchema: Schema = new Schema({
  event_id: { type: Number ,required: true },
  user_id: { type: Number, required: true},
});

export default mongoose.model<IEventRegistration>("EventRegistration", EventRegistrationSchema);
