import mongoose, { Document, Schema } from "mongoose";

export interface IEvent extends Document {
  title: string;
  organizer_id: number;
  venue_id: number;
  date: Date;
  time: string;
  location: string;
}

const EventSchema: Schema = new Schema({
  title: { type: String, required: true },
  organizer_id: { type: Number, required: true },
  venue_id: { type: Number, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
});

export default mongoose.model<IEvent>("Event", EventSchema);
