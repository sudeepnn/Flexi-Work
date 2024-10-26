import { Request, Response } from "express";
import Event from "../model/event";
import Venue from "../model/venue";
import eventRegistration from "../model/eventRegistration";

export const createEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, organizer_id, venue_id, date, time, location } = req.body;
    const event = new Event({ title, organizer_id, venue_id, date, time, location });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
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

export const registerForEvent = async (req: Request, res: Response) : Promise<void> => {
    try {
      const { event_id, user_id } = req.body;
      const registration = new eventRegistration({ event_id, user_id });
      await registration.save();
      res.status(201).json(registration);
    } catch (err) {
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

  export const getEventAttendees = async (req: Request, res: Response) :Promise<void>=> {
    try {
      const { id } = req.params;
      const attendees = await eventRegistration.find({ event_id: id }).populate("user_id", "name email");
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
  
