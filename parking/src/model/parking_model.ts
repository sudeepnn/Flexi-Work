import mongoose, { Schema, model } from "mongoose";

interface Booking {
    userId: string; // Reference to the user ID from the user database
    name: string;
    vehicalnumber: string;
    contact: number;
    startTime: Date; // Start time of the booking in datetime format
    endTime: Date; // End time of the booking in datetime format
    _id: string;
}

interface ParkingSlot {
    area: string;
    block: string;
    slot_number: string;
    floor: string;
    direction: string;
    parkingtype: string; // "4wheeler" or "2wheeler"
    available: boolean;
    booking?: Booking;
}

const bookingSchema = new Schema<Booking>({
    userId: { type: String, required: true }, // Updated to userId
    name: { type: String, required: true },
    vehicalnumber: { type: String, required: true },
    contact: { type: Number, required: true },
    startTime: { type: Date, required: true }, // Start time in datetime format
    endTime: { type: Date, required: false }, // End time in datetime format
    _id: { type: String, required: true },
});

const parkingSlotSchema = new Schema<ParkingSlot>({
    area: { type: String, required: true, enum: ["MLCP", "Front-Gate"] },
    block: { type: String, required: true },
    slot_number: { type: String, required: true },
    floor: { type: String, required: true },
    direction: { type: String, required: true },
    parkingtype: { type: String, required: true, enum: ["4-wheeler", "2-wheeler"] },
    available: { type: Boolean, default: true },
    booking: { type: bookingSchema },
});

// Ensure unique constraint on block and slot_number to prevent duplicate parking slots
parkingSlotSchema.index({ block: 1, slot_number: 1 }, { unique: true });

const ParkingSlotModel = model<ParkingSlot>("ParkingSlot", parkingSlotSchema);
const BookingModel = model<Booking>("Booking", bookingSchema);

export default ParkingSlotModel;
