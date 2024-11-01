import { Router } from "express";
import { addVenue, cancelEvent, cancelEventRegistration, createEvent, deleteVenue, getAllEvents, getAllVenues, getEventAttendees, getUserRegistrations, registerForEvent, updateEvent, updateVenue, updateVenueAvailability } from "../controller/eventController";

const route = Router();

route.post('/event' , createEvent)
route.get('/event', getAllEvents)
route.post('/event/register', registerForEvent)
route.put('/event/:id', updateEvent)
route.delete('/event/:id', cancelEvent)
route.get('/event/attendees/:event_name', getEventAttendees)
route.post('/venue', addVenue)
route.put('/venueupdate/:id', updateVenue)
route.get('/venue', getAllVenues)
route.delete('/venuedelete/:id', deleteVenue)
route.put('/venue/:id', updateVenueAvailability)
route.delete('/event/cancel/:event_name/:user_id', cancelEventRegistration)
route.get('/event/registered/:user_id', getUserRegistrations)

export default route;