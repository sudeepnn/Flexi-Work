import mongoose, { Schema, model } from "mongoose";

// Interface for Response
interface Response {
  feedbackId: string; // Reference to the feedback ID
  message: string; // The response message
  respondedBy: string; // Admin who responded
  createdAt: Date; // Timestamp for the response
}

// Interface for Feedback
interface Feedback {
  user_id: string; // Reference to the user ID from the user database
  type: string;
  message: string;
  respondedByAdmin?: boolean;
  responses?: Response[]; // Array of responses
}

// Schema for Response
const responseSchema = new Schema<Response>({
  feedbackId: { type: String, required: true, ref: "Feedback" }, // Reference to the feedback
  message: { type: String, required: true }, // The response message
  respondedBy: { type: String, required: true }, // Admin who responded
  createdAt: { type: Date, default: Date.now }, // Timestamp for the response
});

// Schema for Feedback
const feedbackSchema = new Schema<Feedback>({
  user_id: { type: String, required: true }, // Reference to the user ID
  type: { type: String, required: true, enum: ['praise', 'complaint', 'help', 'others'] }, // Type of feedback
  message: { type: String, required: true }, // Feedback message
  respondedByAdmin: { type: Boolean, default: false }, // Indicates if responded by admin
  responses: [ responseSchema], // Embed the list of responses
});

// Models
const FeedbackModel = model<Feedback>("Feedback", feedbackSchema);
const ResponseModel = model<Response>("Response", responseSchema);

export { FeedbackModel, ResponseModel };
