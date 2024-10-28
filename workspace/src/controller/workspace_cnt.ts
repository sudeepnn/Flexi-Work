import { Request, Response } from "express";
import WorkspaceModel from "../model/workspace_model";
import workspace_booking from "../model/workspace_booking";
import mongoose from "mongoose";
import axios from 'axios'

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

const USERS_MICROSERVICE_URL ='http://localhost:3001/api/users';

export const bookWorkspace = async (req: Request, res: Response): Promise<void> => {
  try {
    const { workspace_id, user_id, Booking_start_time, Booking_end_time } = req.body;

    // Step 1: Validate user existence in the users microservice
    try {
      const userResponse = await axios.get(`${USERS_MICROSERVICE_URL}/${user_id}`);
      if (userResponse.status !== 200) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
    } catch (error) {
      res.status(404).json({ message: 'User not found in users microservice' });
      return;
    }

    // Step 2: Check if the workspace is available
    const workspace = await WorkspaceModel.findOne({ workspace_id });
    if (!workspace) {
      res.status(400).json({ message: 'Workspace is not present' });
      return;
    }
    if (!workspace.availability) {
      res.status(400).json({ message: 'Workspace is not available for booking' });
      return;
    }

    // Step 3: Create a new booking using custom workspace_id and user_id fields
    const booking = new workspace_booking({
      workspace_id,
      user_id,
      Booking_start_time,
      Booking_end_time,
    });
    await booking.save();

    // Step 4: Update workspace availability to false
    workspace.availability = false;
    await workspace.save();

    res.status(200).json({ message: 'Workspace booked successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Error booking workspace', error });
  }
};

export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;

    // Find the booking and delete it
    const booking = await workspace_booking.findByIdAndDelete(bookingId);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    // Update workspace availability to true
    const workspace = await WorkspaceModel.findOne({ workspace_id: booking.workspace_id });
    if (workspace) {
      workspace.availability = true;
      await workspace.save();
    }

    res.status(200).json({ message: 'Booking canceled and workspace availability updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error canceling booking', error });
  }
};

export const getAllBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    // Fetch all bookings from the workspace_booking collection
    const bookings = await workspace_booking.find();
    
    // Send the bookings as a response
    res.status(200).json(bookings);
  } catch (error) {
    // Handle any errors that occur during the fetching process
    res.status(500).json({ message: 'Error fetching bookings', error });
  }
};

