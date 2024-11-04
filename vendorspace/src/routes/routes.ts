import express,{Request,Response} from "express";
import {getVendorSpaces,getVendorSpaceById, postVendorSpace, putVendorSpace, deleteVendorSpace, getAvailableVendorSpaces, bookingvendorspace, getVendorSpacesByUserId, cancelBooking, vendorcountdetails } from "../controller/vendorspace_cnt";

const router = express.Router();

router.get('/vendorspace',getVendorSpaces)
router.get('/vendorspacecntdetails',vendorcountdetails)
router.get('/vendorspace/:id',getVendorSpaceById)
router.get('/vendorspaceavailable/',getAvailableVendorSpaces)
router.get('/vendor-spaces/user/:userid', getVendorSpacesByUserId);
router.post("/vendor-space/book/:id", bookingvendorspace);
router.post('/vendorspace',postVendorSpace)
router.delete('/vendorspacecancle/:id/:userid',cancelBooking)

router.put('/vendorspace/:id', putVendorSpace);

router.delete('/vendorspace:id',deleteVendorSpace)

export {router}