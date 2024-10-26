import express,{Request,Response} from "express";
import { getAllWorkSpace,postWorkSpace,putWorkSpace,deleteWorkSpace, getWorkspace, bookWorkspace, cancelBooking } from "../controller/workspace_cnt";

const router = express.Router();

router.get('/workspace',getAllWorkSpace)
router.get('/workspace/:id',getWorkspace)
router.post('/workspace',postWorkSpace)
router.put('/workspace/:id', putWorkSpace);
router.delete('/workspace/:id',deleteWorkSpace)
router.post('/workspace/book', bookWorkspace)
router.delete('/workspace/:id', cancelBooking)

export {router}