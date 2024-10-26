import { Request, Response } from "express";
import WorkspaceModel from "../model/workspace_model";
import workspace_booking from "../model/workspace_booking";
import mongoose from "mongoose";

export const getAllWorkSpace = async (req: Request, res: Response): Promise<void> => {
  try {
    const workspaces = await WorkspaceModel.find();
    res.json(workspaces);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving workspaces", error });
  }
};

export const getWorkspace = async (req: Request, res: Response): Promise<void> => {
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

export const postWorkSpace = async (req: Request, res: Response): Promise<void> => {
  try {
    const workspaceData = req.body;
    const newWorkspace = new WorkspaceModel(workspaceData);
    await newWorkspace.save();
    res.status(201).json(newWorkspace);
  } catch (error) {
    res.status(500).json({ message: "Error creating workspace", error });
  }
};

export const putWorkSpace = async (req: Request, res: Response): Promise<void> => {
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

export const deleteWorkSpace = async (req: Request, res: Response): Promise<void> => {
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

export const bookWorkspace = async (req: Request, res: Response) :Promise<void>=> {
  try {
    const { workspaceId, userId, Booking_start_time, Booking_end_time } = req.body;
    const workspaceObjectId = new mongoose.Types.ObjectId(workspaceId);
    // Check if the workspace is available
    const workspace = await WorkspaceModel.findById(workspaceId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    if(!workspace){
      res.status(400).json({message: 'workspace is not present'})
      return;
    }
    if (!workspace.availability) {
      res.status(400).json({ message: 'Workspace is not available for booking' });
      return;
    }

    // Create a new booking
    const booking = new workspace_booking({
      workspace_id: workspace,
      user_id: userObjectId,
      Booking_start_time,
      Booking_end_time,
    });
    await booking.save();

    // Update workspace availability to false
    workspace.availability = false;
    await workspace.save();

    res.status(200).json({ message: 'Workspace booked successfully', booking });
  } catch (error) {
    res.status(500).json(console.log(error))
  }
};

export const cancelBooking = async (req: Request, res: Response) : Promise<void> => {
  try {
    const { bookingId } = req.params;

    // Find the booking and delete it
    const booking = await workspace_booking.findByIdAndDelete(bookingId);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    // Update workspace availability to true
    
    const workspace = await WorkspaceModel.findById(booking.workspace_id);
    if (workspace) {
      workspace.availability = true;
      await workspace.save();
    }

    res.status(200).json({ message: 'Booking canceled and workspace availability updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error canceling booking', error });
  }
};

