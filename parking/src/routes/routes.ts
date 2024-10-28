import express from "express";
import { getAllParkingSlots, postParkingSlot, putParkingSlot, deleteParkingSlot, getAvailableParkingSlots, bookParkingSlot, cancelBooking } from "../controller/parking_cnt";

const router = express.Router();

router.get("/parking", getAllParkingSlots);
router.post("/parking", postParkingSlot);
router.put("/parking/:id", putParkingSlot);
router.delete("/parking/:id", deleteParkingSlot);
router.get("/parking/available", getAvailableParkingSlots);
router.post("/parking/book", bookParkingSlot)
router.delete("/parking/slot/:slotId", cancelBooking)

export { router };
