import express,{Request,Response} from "express";
import { getWorkSpace,postWorkSpace,putWorkSpace,deleteWorkSpace, getAWorkspace } from "../controller/workspace_cnt";

const router = express.Router();

router.get('/',getWorkSpace)
router.get('/:id',getAWorkspace)
router.post('/',postWorkSpace)
router.put('/:id', putWorkSpace);

router.delete('/:id',deleteWorkSpace)

export {router}