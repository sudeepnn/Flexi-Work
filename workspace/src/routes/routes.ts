import express,{Request,Response} from "express";
import { getAllWorkSpace,postWorkSpace,putWorkSpace,deleteWorkSpace, getWorkspace, bookWorkspace, cancelBooking, getAllBookings,getABooking, getAllProjects } from "../controller/workspace_cnt";

const router = express.Router();

router.get('/workspace',getAllWorkSpace)
router.get('/workspace/:id',getWorkspace)
router.post('/workspace',postWorkSpace)
router.put('/workspace/:id', putWorkSpace);
router.delete('/workspace/:id',deleteWorkSpace)
router.post('/workspace/book', bookWorkspace)
router.delete('/workspace/cancel/:bookingId', cancelBooking)
router.get('/workspaceBook', getAllBookings)
router.get('/workspaceBooking/:id', getABooking)
router.get('/workspaceProjects', getAllProjects)

export {router}