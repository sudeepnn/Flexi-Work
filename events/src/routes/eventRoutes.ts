import { Router } from "express";
import { addVenue, cancelEvent, cancelEventRegistration, createEvent, getAllEvents, getAllVenues, getEventAttendees, registerForEvent, updateEvent, updateVenueAvailability } from "../controller/eventController";

const route = Router();

route.post('/event' , createEvent)
route.get('/event', getAllEvents)
route.post('/event/register', registerForEvent)
route.put('/event/:id', updateEvent)
route.delete('/event/:id', cancelEvent)
route.get('/event/attendees/:event_name', getEventAttendees)
route.post('/venue', addVenue)
route.get('/venue', getAllVenues)
route.put('/venue/:id', updateVenueAvailability)
route.delete('/event/cancel/:event_name/:user_id', cancelEventRegistration)

export default route;