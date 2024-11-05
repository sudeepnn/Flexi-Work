import mongoose, { Document, Schema } from "mongoose";


export interface IVenue extends Document {
  venue_name: string;
  capacity: number;
  isAvailable: boolean;
  imgurl:string
  event?: IEvent[]
}

export interface IEvent extends Document {
  event_name: string;
  organizer_id: string;
  venue_id: string;
  start_time: string;
  end_time: string;
  event_attendees ?: IEventRegistration[]
}

export interface IEventRegistration extends Document {
  event_name: string;
  user_id: string;
}

const EventRegistrationSchema: Schema = new Schema({
  event_name: { type: String ,required: true },
  user_id: { type: String, required: true},
});


const EventSchema: Schema = new Schema({
  event_name: { type: String, required: true },
  organizer_id: { type: String, required: true },
  venue_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
  start_time: { type: String, required: true },
  end_time: { type: String, required: true },
  event_attendees : {type: [EventRegistrationSchema]}
});

const VenueSchema: Schema = new Schema({
  venue_name: { type: String, required: true },
  capacity: { type: Number, required: true },
  isAvailable: { type: Boolean, default: true }, // new availability field
  imgurl: { type: String }, // new image url field
  event: {type: [EventSchema]}
});

export const Event = mongoose.model<IEvent>("Event", EventSchema);
export const EventRegistration = mongoose.model<IEventRegistration>("EventRegistration",EventRegistrationSchema)
export default mongoose.model<IVenue>("Venue", VenueSchema);

