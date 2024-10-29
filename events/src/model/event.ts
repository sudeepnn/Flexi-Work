import mongoose, { Document, Schema } from "mongoose";

export interface IEvent extends Document {
  title: string;
  organizer_id: string;
  venue_id: string;
  date: Date;
  time: string;
}

const EventSchema: Schema = new Schema({
  title: { type: String, required: true },
  organizer_id: { type: String, required: true },
  venue_id: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
});

export default mongoose.model<IEvent>("Event", EventSchema);
