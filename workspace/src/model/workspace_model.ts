import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkspace extends Document {
  workspace_id : string
  project: string;
  floor: number;
  //location: string;
  availability: boolean;
}

const WorkspaceSchema: Schema<IWorkspace> = new Schema({
  workspace_id : {type: String, required: true, unique: true},
  project: { type: String, required: true },
  floor: { type: Number, required: true },
  //location: { type: String, required: true },
  availability: { type: Boolean, default: true },
});

export default mongoose.model<IWorkspace>('Workspace', WorkspaceSchema);
