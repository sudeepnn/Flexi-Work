import { Request, Response } from "express";
import WorkspaceModel from "../model/workspace_model";
import workspace_booking from "../model/workspace_booking";
import mongoose, { MongooseError } from "mongoose";
import axios from 'axios'
import workspace_model from "../model/workspace_model";

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
    } catch (error: any) {
      // Check for duplicate error
      if (error.code === 11000) {
        res.status(400).json({ message: 'Duplicate workspace_id. A workspace with this ID already exists.' });
        return;
      }
      
      // Log unexpected errors
      console.error(error);
      res.status(500).json({ message: 'Error creating workspace', error: error.message });
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

const USERS_MICROSERVICE_URL ='http://localhost:3001/api/v1/users';

export const bookWorkspace = async (req: Request, res: Response): Promise<void> => {
  try {
    const { workspace_id, user_id, Booking_start_time, project, floor } = req.body;

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
    const workspace = await WorkspaceModel.findOne({ workspace_id, floor, project,availability:true});
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
      project,
      floor
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

export const cancelBooking = async (req: Request, res: Response) => {
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

export const getAllBookings = async (req: Request, res: Response) => {
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

interface ProjectObject {
  [key: string]: boolean; // Each key will be a string (project name) and the value will be boolean
}

// Controller to get all unique projects as key-value pairs
export const getAllProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    // Use distinct to find unique projects
    const uniqueProjects: string[] = await workspace_model.distinct('project');
    console.log(uniqueProjects)

    // Convert the array of unique projects to a key-value pair object
    const projectsObject: { [key: string]: string } = {};

    uniqueProjects.forEach((project, index) => {
      projectsObject[`project-${index + 1}`] = project; // Set key as project-{index} and value as project name
    });

    // Send the unique projects object as a response
    res.status(200).json(projectsObject);
  } catch (error) {
    // Handle any errors that occur during the fetching process
    res.status(500).json({ message: 'Error fetching unique projects', error });
  }
};

