import { Router } from "express";
import { addVenue, cancelEvent, createEvent, getAllEvents, getAllVenues, getEventAttendees, registerForEvent, updateEvent, updateVenueAvailability } from "../controller/eventController";

const route = Router();

route.post('/events' , createEvent)
route.get('/events', getAllEvents)
route.post('/event/register', registerForEvent)
route.put('/event/:id', updateEvent)
route.delete('/event/:id', cancelEvent)
route.get('/event/attendees/:id', getEventAttendees)
route.post('/venue', addVenue)
route.get('/venue', getAllVenues)
route.put('/venue/:id', updateVenueAvailability)

export default route;