import mongoose, { Schema, model } from "mongoose";

interface Booking {
    userId: string; // Reference to the user ID from the user database
    vehicalnumber: string;
    contact: number;
    startTime: Date; // Start time of the booking
    //endTime: Date;
    slot_number: string;
}

interface ParkingSlot {
    slot_number: string;
    //location: string;
    floor: number;
    parkingtype: string; // "4wheeler" or "2wheeler"
    available: boolean;
    booking?: Booking;
}

const bookingSchema = new Schema<Booking>({
    userId: { type: String, required: true }, // Updated to userId
    vehicalnumber: { type: String, required: true },
    contact: { type: Number, required: true },
    startTime: { type: Date, required: true }, // Start time of the booking
    //endTime: { type: Date, required: true },
    slot_number: { type: String, required: true },
});

const parkingSlotSchema = new Schema<ParkingSlot>({
    slot_number: { type: String, required: true },
    //location: { type: String, required: true },
    floor: { type: Number, required: true },
    parkingtype: { type: String, required: true, enum: ["4-wheeler", "2-wheeler"] },
    available: { type: Boolean,default: true },
    booking: { type: bookingSchema }
});

const ParkingSlotModel = model<ParkingSlot>("ParkingSlot", parkingSlotSchema);
const BookingModel = model<Booking>("Booking", bookingSchema);

export default ParkingSlotModel;
