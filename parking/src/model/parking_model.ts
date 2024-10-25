import mongoose, { Schema, model } from "mongoose";

interface Booking {
    name: string;
    vehicalnumber: string;
    contact: number;
}

interface ParkingSlot {
    parkingslot: string;
    location: string;
    floor: string;
    parkingtype: string; // "4wheeler" or "2wheeler"
    available: boolean;
    booking?: Booking;
}

const bookingSchema = new Schema<Booking>({
    name: { type: String, required: true },
    vehicalnumber: { type: String, required: true },
    contact: { type: Number, required: true }
});

const parkingSlotSchema = new Schema<ParkingSlot>({
    parkingslot: { type: String, required: true },
    location: { type: String, required: true },
    floor: { type: String, required: true },
    parkingtype: { type: String, required: true, enum: ["4wheeler", "2wheeler"] },
    available: { type: Boolean, required: true },
    booking: { type: bookingSchema }
});

const ParkingSlotModel = model<ParkingSlot>("ParkingSlot", parkingSlotSchema);

export default ParkingSlotModel;
