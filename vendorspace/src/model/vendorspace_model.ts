import mongoose, { Schema, model } from "mongoose";

interface Booking {
    userid: string;
    name: string;
    phone: number;
    bookeddate: Date;
    
}

interface VendorSpace {
    stallname: string;
    rent: number;
    imgurl:string;
    avalablestatus: boolean;
    bookings?: Booking[];
}

const bookingSchema = new Schema<Booking>({
    userid: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: Number, required: true },
    bookeddate: { type: Date, required: true },
   
});

const vendorSpaceSchema = new Schema<VendorSpace>({
    stallname: { type: String, required: true },
    rent: { type: Number, required: true },
    imgurl: { type: String, required: true },
    avalablestatus: { type: Boolean, required: true },
    bookings: { type: [bookingSchema],default:[] }
});

const VendorSpaceModel = model<VendorSpace>("VendorSpace", vendorSpaceSchema);

export default VendorSpaceModel;
