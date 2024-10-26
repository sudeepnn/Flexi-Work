import mongoose, { Document, Schema } from "mongoose";

export interface IFeedback extends Document {
  userId: mongoose.Types.ObjectId;
  type: string;
  message: string;
  response?: string;
  respondedByAdmin?: boolean;
}

const FeedbackSchema: Schema = new Schema({
  userId: { type: String, required: true },
  type: { type: String, required: true },
  message: { type: String, required: true },
  response: { type: String },
  respondedByAdmin: { type: Boolean, default: false },
});

export default mongoose.model<IFeedback>("Feedback", FeedbackSchema);
