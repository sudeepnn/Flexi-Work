import mongoose, { Schema, model } from "mongoose";

interface Booking {
    userid: string;
    name: string;
    phone: number;
    billingdate: Date;
    bookeddate: Date;
    bookingexpiredate: Date;
    payment: boolean;
}

interface VendorSpace {
    stallname: string;
    location: string;
    floor: number;
    price: number;
    avalablestatus: boolean;
    bookings?: Booking[];
}

const bookingSchema = new Schema<Booking>({
    userid: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: Number, required: true },
    billingdate: { type: Date, required: true },
    bookeddate: { type: Date, required: true },
    bookingexpiredate: { type: Date, required: true },
    payment: { type: Boolean, required: true }
});

const vendorSpaceSchema = new Schema<VendorSpace>({
    stallname: { type: String, required: true },
    location: { type: String, required: true },
    floor: { type: Number, required: true },
    price: { type: Number, required: true },
    avalablestatus: { type: Boolean, required: true },
    bookings: { type: [bookingSchema],default:[] }
});

const VendorSpaceModel = model<VendorSpace>("VendorSpace", vendorSpaceSchema);

export default VendorSpaceModel;
