import express from "express";
import { getParkingSlots, postParkingSlot, putParkingSlot, deleteParkingSlot } from "../controller/parking_cnt";

const router = express.Router();

router.get("/", getParkingSlots);
router.post("/", postParkingSlot);
router.put("/:id/update", putParkingSlot);
router.delete("/:id", deleteParkingSlot);

export { router };
