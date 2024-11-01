import { Request, Response } from "express";
import Event from "../model/event";
import Venue from "../model/venue";
import eventRegistration from "../model/eventRegistration";
import axios from "axios";

export const createEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { event_name, organizer_id, venue_id, date, time } = req.body;

    // Check if the organizer exists and has the role 'manager'
    const userResponse = await axios.get(`http://localhost:3001/api/v1/users/${organizer_id}`);
    const user = userResponse.data;

    if (!user || user.role !== 'manager') {
      res.status(403).json({ message: 'Organizer must be a registered manager.' });
      return;
    }

    // Check if the venue exists
    const venue = await Venue.findById(venue_id);
    if (!venue) {
       res.status(404).json({ message: 'Venue not found.' });
       return;
    }

    // Check if the venue is available for the specified date and time
    const isVenueAvailable = await Event.findOne({
      venue_id,
      date,
      time,
    });
    if (isVenueAvailable) {
      res.status(400).json({ message: 'Venue is not available for booking at this time.' });
      return;
    }

    // Create and save the event if all checks pass
    const event = new Event({ event_name, organizer_id, venue_id, date, time });
    await event.save();
    res.status(201).json(event);
    
  } catch (err) {
    // Handle Axios error if user service is unavailable
    if (axios.isAxiosError(err)) {
      res.status(500).json({ message: 'Error connecting to the user service.' });
      return;
    }
    res.status(500).send(err);
  }
};


export const getAllEvents = async (_req: Request, res: Response): Promise<void> => {
  try {
    const events = await Event.find().populate("venue_id", "venue_name capacity");
    res.json(events);
  } catch (err) {
    res.status(500).send("Error retrieving events");
  }
};

export const registerForEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { event_name, user_id } = req.body;

    // Check if the user exists
    const userResponse = await axios.get(`http://localhost:3001/api/v1/users/${user_id}`);
    const user = userResponse.data;

    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    // Check if the event exists by event name
    const event = await Event.findOne({  event_name });
    if (!event) {
      res.status(404).json({ message: 'Event not found.' });
      return 
    }

    // Check if the user is already registered for the event
    const existingRegistration = await eventRegistration.findOne({ event_name, user_id });
    if (existingRegistration) {
      res.status(400).json({ message: 'User is already registered for this event.' });
      return 
    }

    // Create and save the registration if no duplicate exists
    const registration = new eventRegistration({ event_name, user_id });
    await registration.save();
    res.status(201).json(registration);
    
  } catch (err) {
    if (axios.isAxiosError(err)) {
      res.status(500).json({ message: 'Error connecting to the user service.' });
      return 
    }
    res.status(500).send("Error registering for event");
  }
};

  export const updateEvent = async (req: Request, res: Response) :Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const event = await Event.findByIdAndUpdate(id, updateData, { new: true });
      if (!event) res.status(404).send("Event not found");
      res.json(event);
    } catch (err) {
      res.status(500).send("Error updating event");
    }
  };

  export const cancelEvent = async (req: Request, res: Response) :Promise<void>=> {
    try {
      const { id } = req.params;
      const event = await Event.findByIdAndDelete(id);
      if (!event) res.status(404).send("Event not found");
      res.send("Event cancelled successfully");
    } catch (err) {
      res.status(500).send("Error cancelling event");
    }
  };

  export const getEventAttendees = async (req: Request, res: Response): Promise<void> => {
    try {
      const { event_name } = req.params;
  
      // Find the event by name
      const event = await Event.findOne({ event_name });
      if (!event) {
        res.status(404).json({ message: 'Event not found.' });
        return;
      }
  
      // Find all registrations for the event and populate only the name of each user
      const attendees = await eventRegistration.find({ event_name }).populate("user_id", "name");
  
      res.json(attendees);
    } catch (err) {
      res.status(500).send("Error retrieving event attendees");
    }
  };

  
  export const addVenue = async (req: Request, res: Response) :Promise<void> => {
    try {
      const { venue_name, capacity, isAvailable } = req.body;
      const venue = new Venue({ venue_name, capacity, isAvailable });
      await venue.save();
      res.status(201).json(venue);
    } catch (err) {
      res.status(500).send("Error adding venue");
    }
  };
  
  // Get all venues, with optional availability filter
  export const getAllVenues = async (req: Request, res: Response) : Promise<void> => {
    try {
      const { available } = req.query;
      const query = available ? { isAvailable: available === "true" } : {};
      const venues = await Venue.find(query);
      res.json(venues);
    } catch (err) {
      res.status(500).send("Error retrieving venues");
    }
  };

  export const updateVenue = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { venue_name, capacity, isAvailable } = req.body;
  
      const updatedVenue = await Venue.findByIdAndUpdate(
        id,
        { venue_name, capacity, isAvailable },
        { new: true, runValidators: true }
      );
  
      if (!updatedVenue) {
        res.status(404).send("Venue not found");
        return;
      }
  
      res.json(updatedVenue);
    } catch (err) {
      res.status(500).send("Error updating venue");
    }
  }

  export const deleteVenue = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
  
      const deletedVenue = await Venue.findByIdAndDelete(id);
  
      if (!deletedVenue) {
        res.status(404).send("Venue not found");
        return;
      }
  
      res.status(200).json({ message: "Venue deleted successfully" });
    } catch (err) {
      res.status(500).send("Error deleting venue");
    }
  };
  
  
  // Update venue availability status
  export const updateVenueAvailability = async (req: Request, res: Response) : Promise<void>=> {
    try {
      const { id } = req.params;
      const { isAvailable } = req.body;
      const venue = await Venue.findByIdAndUpdate(id, { isAvailable }, { new: true });
      if (!venue) res.status(404).send("Venue not found");
      res.json(venue);
    } catch (err) {
      res.status(500).send("Error updating venue availability");
    }
  };

  export const cancelEventRegistration = async (req: Request, res: Response): Promise<void> => {
    try {
      const { event_name, user_id } = req.params;
  
      // Find the event by name
      const event = await Event.findOne({ event_name });
      if (!event) {
        res.status(404).json({ message: 'Event not found.' });
        return 
      }
  
      // Find and delete the registration
      const registration = await eventRegistration.findOneAndDelete({ event_name, user_id });
      if (!registration) {
        res.status(404).json({ message: 'Registration not found for the specified event and user.' });
        return 
      }
  
      res.status(200).json({ message: 'Registration canceled successfully.' });
    } catch (err) {
      res.status(500).send("Error canceling registration");
    }
  };
  
  export const getUserRegistrations = async (req: Request, res: Response): Promise<void> => {
    try {
      const { user_id } = req.params;
  
      // Find all registrations for the user
      const registrations = await eventRegistration.find({ user_id }).populate('event_name');
  
      if (registrations.length === 0) {
        res.status(404).json({ message: 'No registrations found for this user.' });
        return
      }
  
      // Respond with the registration details
      res.status(200).json(registrations);
    } catch (err) {
      res.status(500).send({message: "Error retrieving user registrations",err});
    }
  };