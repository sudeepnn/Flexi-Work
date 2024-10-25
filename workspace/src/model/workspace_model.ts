import mongoose,{Schema,model} from "mongoose";

interface Workspace {
    department: string;
    floor: number;
    available: boolean;
    bookedBy: string;
  }

const workspaceSchema =new Schema<Workspace>({
    department: {
        type: String,
        required: true
    },
    floor: {
        type: Number,
        required: true
    },
    available: {
        type: Boolean,
        required: true
    },
    bookedBy: {
        type: String,
        required: false
    }
})

const WorkspaceModel = model<Workspace>('workspace', workspaceSchema)

export default WorkspaceModel;

