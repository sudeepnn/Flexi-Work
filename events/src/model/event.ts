import mongoose, { Document, Schema } from "mongoose";

export interface IEvent extends Document {
  event_name: string;
  organizer_id: string;
  venue_id: string;
  start_time: string;
  end_time: string;
}

const EventSchema: Schema = new Schema({
  event_name: { type: String, required: true },
  organizer_id: { type: String, required: true },
  venue_id: { type: String, required: true },
  start_time: { type: String, required: true },
  end_time: { type: String, required: true },
});

export default mongoose.model<IEvent>("Event", EventSchema);
