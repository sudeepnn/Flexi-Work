import { Request, Response } from "express";
import { Event, EventRegistration } from "../model/venue";
import Venue, { IEvent } from "../model/venue";
//import eventRegistration from "../model/eventRegistration";
import axios from "axios";
import mongoose from "mongoose";

export const createEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { event_name, organizer_id, venue_id, start_time, end_time } = req.body;

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

    // Check if the venue is available
    if (!venue.isAvailable) {
      res.status(400).json({ message: 'Venue is not available for booking.' });
      return;
    }

    // Create the event
    const event: IEvent = new Event({
      event_name,
      organizer_id,
      venue_id,
      start_time,
      end_time,
      event_attendees: [], // Initialize with an empty array for attendees
    });

    await event.save();

    // Add the event to the venue's events array
    venue.event?.push(event) // Push the created event into the venue's events array
    venue.isAvailable = false; // Mark the venue as unavailable
    await venue.save(); // Save the venue with the new event

    res.status(201).json(event);

  } catch (err) {
    // Handle Axios error if user service is unavailable
    if (axios.isAxiosError(err)) {
      res.status(500).json({ message: 'Error connecting to the user service.' });
      return;
    }
    res.status(500).json({ message: 'An error occurred while creating the event.' });
    console.log(err);
  }
};



export const getAllEvents = async (_req: Request, res: Response): Promise<void> => {
  try {
    const events = await Event.find()
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
    const existingRegistration = await EventRegistration.findOne({ event_name, user_id });
    if (existingRegistration) {
      res.status(400).json({ message: 'User is already registered for this event.' });
      return 
    }

    // Create and save the registration if no duplicate exists
    const registration = new EventRegistration({ event_name, user_id });
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
      const attendees = await EventRegistration.find({ event_name }).populate("user_id", "name");
  
      res.json(attendees);
    } catch (err) {
      res.status(500).send("Error retrieving event attendees");
    }
  };

  
  export const addVenue = async (req: Request, res: Response) :Promise<void> => {
    try {
      const { venue_name, capacity, isAvailable,imgurl } = req.body;
      const venue = new Venue({ venue_name, capacity, isAvailable ,imgurl});
      await venue.save();
      res.status(201).json(venue);
    } catch (err) {
      res.status(500).send("Error adding venue");
    }
  };
  
  
  // Get all venues, with optional availability filter
  export const getAllVenues = async (req: Request, res: Response) => {
    try {
      const venues = await Venue.find(); // Fetch all venues from the database
      res.status(200).json(venues); // Respond with the list of venues
    } catch (error) {
      console.error('Error fetching venues:', error);
      res.status(500).json({ message: 'Internal server error' });
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
      const registration = await EventRegistration.findOneAndDelete({ event_name, user_id });
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
      const registrations = await EventRegistration.find({ user_id }).populate('event_name');
  
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

  export const getEventsByVenueName = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
  
      // Find the venue by name
      const venue = await Venue.findById(id);
      if (!venue) {
        res.status(404).json({ message: 'Venue not found.' });
        return;
      }
  
      // Find events associated with the venue
      const events = await Event.find({ venue_id: venue._id }).populate('organizer_id', 'name email');
      
      // Check if events are found
      if (events.length === 0) {
        res.status(404).json({ message: 'No events found for this venue.' });
        return;
      }
  
      res.status(200).json(events);
      
    } catch (err) {
      res.status(500).json({ message: 'Error retrieving events.', error: err });
    }
  };

  export const getUserBookedVenues = async (req: Request, res: Response): Promise<void> => {
    const { organizerId } = req.params; // Use organizerId instead of userId

    try {
        // Fetch bookings for the organizer
        const bookings = await Venue.find({ organizer_id: organizerId })

        // Check if bookings is null or empty and respond accordingly
        if (!bookings || bookings.length === 0) {
            res.status(404).json({ message: 'No bookings found for this organizer.' });
            return;
        }

        // Extract venue details from bookings
        

        res.status(200).json(bookings);
    } catch (error) {
        console.error('Error fetching venues:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const getVenuesByOrganizerId =  async (req: Request, res: Response) => {
  const { organizer_id } = req.params;

  try {
    // Find events organized by the given organizer_id
    const events = await Event.find({ organizer_id }).select("venue_id").lean();

    // Extract unique venue IDs from events
    const venueIds = [...new Set(events.map((event) => event.venue_id))];

    // Find venues associated with those venue IDs
    const venues = await Venue.find({ _id: { $in: venueIds } });

    res.status(200).json(venues);
  } catch (error) {
    console.error("Error fetching venues:", error);
    res.status(500).json({ message: "Server error" });
  }
};