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
    const updatedWorkspace = await WorkspaceModel.findOneAndUpdate({workspace_id:id}, req.body, { new: true });
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
    const deletedWorkspace = await WorkspaceModel.findOneAndDelete({workspace_id:id});
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

    const { workspace_id, user_id, Booking_start_time, project,name, floor } = req.body;


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
    const workspace = await WorkspaceModel.findOne({ workspace_id, floor, project, availability: true });
    if (!workspace) {
      res.status(400).json({ message: 'Workspace is not available for booking' });
      return;
    }

    // Step 3: Create a new booking
    const booking = new workspace_booking({
      workspace_id,
      user_id,
      name,
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
    console.error("Error booking workspace:", error);
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

export const getAllWorkspaces = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.project; // Get project ID from URL parameters

    // Fetch all workspaces related to the given projectId
    const workspaces = await WorkspaceModel.find({ project: projectId });

    // Send the workspaces as a response
    res.status(200).json(workspaces);
  } catch (error) {
    // Handle any errors that occur during the fetching process
    res.status(500).json({ message: 'Error fetching workspaces', error });
  }
};


export const getABooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id } = req.params;
    const workspace = await workspace_booking.findOne({user_id});
    if (!workspace) {
      res.status(404).json({ message: "Workspacebooking not found" });
      return;
    }
    res.json(workspace);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving Workspacebooking", error });
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

export const getFloorByProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { project } = req.params;

    // Find the workspace based on the project
    const workspace = await WorkspaceModel.findOne({ project });

    // If workspace is not found, return a 404 response
    if (!workspace) {
      res.status(404).json({ message: 'Workspace with this project not found' });
      return;
    }

    // Send only the floor as a response
    res.status(200).json({ floor: workspace.floor });
  } catch (error) {
    // Handle any errors that occur during the fetching process
    res.status(500).json({ message: 'Error retrieving floor for the project', error });
  }
};

export const getAvailableWorkspaces = async (req: Request, res: Response): Promise<void> => {
  try {
    const { project, floor } = req.params;

    // Validate query parameters
    if (!project || !floor) {
      res.status(400).json({ message: 'Project and floor are required query parameters' });
      return;
    }

    // Find available workspaces matching the specified project and floor
    const workspaces = await WorkspaceModel.find({
      project: project as string,
      floor: Number(floor),
      availability: true
    });

    // If no workspaces are found, return an empty list
    if (!workspaces.length) {
      res.status(404).json({ message: 'No available workspaces found for the specified project and floor' });
      return;
    }

    // Send the list of available workspaces as a response
    res.status(200).json(workspaces);
  } catch (error) {
    // Handle any errors that occur during the fetching process
    res.status(500).json({ message: 'Error retrieving available workspaces', error });
  }
};

export const bookmyWorkspace = async (req: Request, res: Response) => {
  try {
    const { _id } = req.params; // Get workspace ID from URL parameters
    const { userId, name, contact, startTime } = req.body; // Booking details from request body

    // Find the workspace by ID
    const workspace = await WorkspaceModel.findById( _id );

    if (!workspace) {
       res.status(404).json({ message: 'Workspace not found' });
    }
    else{
      
    // Check if the workspace is available
    if (!workspace.availability) {
      res.status(400).json({ message: 'Workspace is not available for booking' });
   }

   // Create a new booking object
   const newBooking = { userId, name, contact, startTime };

   // Add the booking to the workspace and set availability to false
   workspace.bookings = workspace.bookings ? [...workspace.bookings, newBooking] : [newBooking];
   workspace.availability = false;

   // Save the updated workspace
   await workspace.save();

   // Send the updated workspace as a response
   res.status(201).json({ message: 'Workspace booked successfully', workspace });
    }

  } catch (error) {
    res.status(500).json({ message: 'Error booking workspace', error });
  }
};

export const getUserBookings = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params; // Get userId from URL parameters

    // Find all workspaces containing bookings for the given userId
    const workspaces = await workspace_model.find({ "bookings.userId": userId });

    // Extract and enhance bookings with workspace_id and project fields
    const userBookings = workspaces.flatMap(workspace => 
      (workspace.bookings || [])
        .filter(booking => booking.userId === userId)
        .map(booking => ({
          userId: booking.userId,
          name: booking.name,
          contact: booking.contact,
          startTime: booking.startTime,
          workspace_id: workspace.workspace_id,
          project: workspace.project
        }))
    );

    // Send the user's bookings as a response
    res.status(200).json(userBookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user bookings', error });
  }
};
export const cancelworkspaceBooking = async (req: Request, res: Response) => {
  try {
    const { workspace_id, userId } = req.params; // Get workspace_id and userId from URL parameters

    // Find the workspace by workspace_id
    const workspace = await workspace_model.findOne({ workspace_id });

    if (!workspace) {
       res.status(404).json({ message: 'Workspace not found' });
    }
    else{
      
    // Check if there is a booking with the specified userId
    const bookingExists = workspace.bookings?.some(booking => booking.userId === userId);

    if (!bookingExists) {
       res.status(404).json({ message: 'Booking not found for the specified user' });
    }

    // Empty the bookings array and set availability to true
    workspace.bookings = [];
    workspace.availability = true;

    // Save the updated workspace
    await workspace.save();

    res.status(200).json({ message: 'Booking canceled successfully', workspace });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error canceling booking', error });
  }
};

export const getBookingDetails = async (req: Request, res: Response) => {
  try {
    const { workspace_id } = req.params; // Get workspace_id from URL parameters

    // Find the workspace by workspace_id
    const workspace = await workspace_model.findOne({workspace_id: workspace_id });

    if (!workspace) {
       res.status(404).json({ message: 'Workspace not found' });
    }
    else{
      
    // Check if there are any bookings
    if (!workspace.bookings || workspace.bookings.length === 0) {
      res.status(404).json({ message: 'No bookings found for this workspace' });
   }
else{
  
   // Send the bookings as a response
   res.status(200).json({ bookings: workspace.bookings });
}
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking details', error });
  }
};