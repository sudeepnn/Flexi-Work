import { Request, Response } from "express";
import WorkspaceModel from "../model/workspace_model";

const getWorkSpace = async (req: Request, res: Response): Promise<void> => {
  try {
    const workspaces = await WorkspaceModel.find();
    res.json(workspaces);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving workspaces", error });
  }
};

const getAWorkspace = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const workspace = await WorkspaceModel.findById(id);
      if (!workspace) {
        res.status(404).json({ message: "Workspace not found" });
        return;
      }
      res.json(workspace);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving workspace", error });
    }
  };

const postWorkSpace = async (req: Request, res: Response): Promise<void> => {
  try {
    const workspaceData = req.body;
    const newWorkspace = new WorkspaceModel(workspaceData);
    await newWorkspace.save();
    res.status(201).json(newWorkspace);
  } catch (error) {
    res.status(500).json({ message: "Error creating workspace", error });
  }
};

const putWorkSpace = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updatedWorkspace = await WorkspaceModel.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedWorkspace) {
      res.status(404).json({ message: "Workspace not found" });
      return;
    }
    res.json(updatedWorkspace);
  } catch (error) {
    res.status(500).json({ message: "Error updating workspace", error });
  }
};

const deleteWorkSpace = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedWorkspace = await WorkspaceModel.findByIdAndDelete(id);
    if (!deletedWorkspace) {
      res.status(404).json({ message: "Workspace not found" });
      return;
    }
    res.json({ message: "Workspace deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting workspace", error });
  }
};

export { getWorkSpace, postWorkSpace, putWorkSpace, deleteWorkSpace ,getAWorkspace };
