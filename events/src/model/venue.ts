import mongoose, { Document, Schema } from "mongoose";

export interface IVenue extends Document {
  venue_name: string;
  capacity: number;
  isAvailable: boolean;
  imgurl:string
}

const VenueSchema: Schema = new Schema({
  venue_name: { type: String, required: true },
  capacity: { type: Number, required: true },
  isAvailable: { type: Boolean, default: true }, // new availability field
  imgurl: { type: String } // new image url field
});

export default mongoose.model<IVenue>("Venue", VenueSchema);
