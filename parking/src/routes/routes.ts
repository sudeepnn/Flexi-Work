import express from "express";
import { getAllParkingSlots, putParkingSlot, deleteParkingSlot, getAvailableParkingSlots, bookParkingSlot, cancelBooking, getParkingDetailsByUserId, getAvailableSlotsByFloor, getAllFloors, postParkingSlot, getUniqueFloorsByArea, getAvailableBlocksByFloorAndArea, getSlotsByAreaFloorBlock, getBlocksByAreaFloorType, getSlotsByCriteria, getParkingDetailsByslotid, parkingcountdetails, checkAndSendParkingEndEmails } from "../controller/parking_cnt";
import route from '../../../events/src/routes/eventRoutes';

const router = express.Router();

router.get("/parking", getAllParkingSlots);
router.post("/parking", postParkingSlot);
router.put("/parking/:id", putParkingSlot);
router.delete("/parking/:id", deleteParkingSlot);
router.get("/parking/available", getAvailableParkingSlots);
router.post("/parking/book", bookParkingSlot)
router.get("/parking/:userId", getParkingDetailsByUserId)

router.delete("/parking/slot/:id", cancelBooking)

router.get("/parkingslotdetails/:id", getParkingDetailsByslotid)

router.get("/parking/floor/:floor", getAvailableSlotsByFloor)
router.get("/parkingFloors", getAllFloors)
router.get("/parkingFloor/:area", getUniqueFloorsByArea)
router.get("/parking/block/:area/:floor", getAvailableBlocksByFloorAndArea)
router.get("/parking/allSlots/:area/:floor/:block", getSlotsByAreaFloorBlock)
router.get("/parking/block/:area/:floor/:parkingtype", getBlocksByAreaFloorType)
router.get("/parkingSlots/:area/:floor/:parkingtype/:block", getSlotsByCriteria)
router.get("/parkingcntdetails", parkingcountdetails)
router.post('/check-end-time-emails', checkAndSendParkingEndEmails);

export { router };
