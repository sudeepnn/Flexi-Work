import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkspace extends Document {
  workspace_id : number
  department: string;
  floor: number;
  location: string;
  availability: boolean;
}

const WorkspaceSchema: Schema<IWorkspace> = new Schema({
  workspace_id : {type: Number, required: true, unique: true},
  department: { type: String, required: true },
  floor: { type: Number, required: true },
  location: { type: String, required: true },
  availability: { type: Boolean, default: true },
});

export default mongoose.model<IWorkspace>('Workspace', WorkspaceSchema);
