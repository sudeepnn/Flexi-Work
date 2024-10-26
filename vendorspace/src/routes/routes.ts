import express,{Request,Response} from "express";
import {getVendorSpaces,getVendorSpaceById, postVendorSpace, putVendorSpace, deleteVendorSpace,payBill } from "../controller/vendorspace_cnt";

const router = express.Router();

router.get('/vendorspace',getVendorSpaces)
router.get('/vendorspace/:id',getVendorSpaceById)
router.post('/vendorspace',postVendorSpace)
router.post('/vendorspace/paybill/:id',payBill)
router.put('/vendorspace/:id', putVendorSpace);

router.delete('/vendorspace:id',deleteVendorSpace)

export {router}