import express from "express";
import { getAllParkingSlots, postParkingSlot, putParkingSlot, deleteParkingSlot, getAvailableParkingSlots, bookParkingSlot, cancelBooking, getParkingDetailsByUserId, getAvailableSlotsByFloor } from "../controller/parking_cnt";
import route from '../../../events/src/routes/eventRoutes';

const router = express.Router();

router.get("/parking", getAllParkingSlots);
router.post("/parking", postParkingSlot);
router.put("/parking/:id", putParkingSlot);
router.delete("/parking/:id", deleteParkingSlot);
router.get("/parking/available", getAvailableParkingSlots);
router.post("/parking/book", bookParkingSlot)
router.get("/parking/:userId", getParkingDetailsByUserId)
router.delete("/parking/slot/:slotId", cancelBooking)
router.get("/parking/floor/:floor", getAvailableSlotsByFloor)

export { router };
