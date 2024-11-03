import express,{Request,Response} from "express";

import { getAllWorkSpace,postWorkSpace,putWorkSpace,deleteWorkSpace, getWorkspace, bookWorkspace, cancelBooking, getAllBookings, getAllProjects, getFloorByProject, getAvailableWorkspaces, getABooking, getAllWorkspaces, bookmyWorkspace, getUserBookings, cancelworkspaceBooking, getBookingDetails } from "../controller/workspace_cnt";

const router = express.Router();

router.get('/workspace',getAllWorkSpace)
router.get('/workspace/:id',getWorkspace)
router.post('/workspace',postWorkSpace)
router.put('/workspace/:id', putWorkSpace);
router.delete('/workspace/:id',deleteWorkSpace)
router.post('/workspace/book', bookWorkspace)
router.delete('/workspace/cancel/:bookingId', cancelBooking)
router.get('/workspaceBook', getAllBookings)
router.get('/workspaceBooking/:user_id', getABooking)
router.get('/workspaceProjects', getAllProjects)
router.get('/workspace/floor/:project', getFloorByProject)
router.get('/workspace/available/:project/:floor', getAvailableWorkspaces)
//
router.get('/workspace/basedonproject/:project', getAllWorkspaces)
router.put('/workspace/myworkspace/:_id',bookmyWorkspace)
router.get('/bookings/user/:userId', getUserBookings);
router.delete('/workspaces/:workspace_id/bookings/:userId', cancelworkspaceBooking);
router.get('/workspacess/bookings/:workspace_id', getBookingDetails);

export {router}