import { Request, Response } from "express";
import VendorSpaceModel from "../model/vendorspace_model";

const getVendorSpaces = async (req: Request, res: Response): Promise<void> => {
    try {
        const vendorSpaces = await VendorSpaceModel.find();
        res.json(vendorSpaces);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving vendor spaces', error });
    }
};

const getVendorSpaceById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const vendorSpace = await VendorSpaceModel.findById(id);
        if (!vendorSpace) {
            res.status(404).json({ message: 'Vendor space not found' });
        }
        else
            res.json(vendorSpace);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving vendor space', error });
    }
};
const getVendorSpacesByUserId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userid } = req.params;  // Extract userid from request parameters
        const vendorSpaces = await VendorSpaceModel.find({ "bookings.userid": userid }); // Query to find vendor spaces with matching user ID

        if (!vendorSpaces.length) {
            res.status(404).json({ message: 'No vendor spaces found for this user' });
        } else {
            res.json(vendorSpaces); // Respond with the found vendor spaces
        }
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving vendor spaces', error });
    }
};
export const getAvailableVendorSpaces = async (req: Request, res: Response): Promise<void> => {
    try {
        // Query the database for VendorSpaces where avalablestatus is true
        const availableVendorSpaces = await VendorSpaceModel.find({ avalablestatus: true });
        res.json(availableVendorSpaces);
    } catch (error) {
        throw new Error('Error fetching available vendor spaces');
    }
};

const postVendorSpace = async (req: Request, res: Response): Promise<void> => {
    try {
        const vendorSpaceData = req.body;
        const newVendorSpace = new VendorSpaceModel(vendorSpaceData);
        await newVendorSpace.save();
        res.status(201).json(newVendorSpace);
    } catch (error) {
        res.status(500).json({ message: 'Error creating vendor space', error });
    }
};

export const bookingvendorspace = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { userid, name, phone, bookeddate } = req.body;

    try {
        const vendorSpace = await VendorSpaceModel.findById(id);

        if (!vendorSpace) {
            res.status(404).json({ message: "Vendor space not found" });
            return
        }

        // Check if the space is available
        if (!vendorSpace.avalablestatus) {
            res.status(400).json({ message: "Vendor space is not available" });
            return
        }

        // Add new booking
        if (vendorSpace.bookings) {
            vendorSpace.bookings.push({
                userid,
                name,
                phone,
                bookeddate
            });
        }

        // Mark as unavailable if required
        vendorSpace.avalablestatus = false;

        await vendorSpace.save();

        res.status(200).json({ message: "Vendor space booked successfully", vendorSpace });
    } catch (error) {
        console.error("Error booking vendor space:", error);
        res.status(500).json({ message: "An error occurred", error });
    }
};
export const vendorcountdetails = async (req: Request, res: Response): Promise<void> => {
    try {
        const totalSlots = await VendorSpaceModel.countDocuments();
        const availableCount = await VendorSpaceModel.countDocuments({ avalablestatus: true });
        
  
        res.json( {
            totalSlots,
            availableCount,
            
        });
    } catch (error) {
        console.error('Error fetching parking counts:', error);
        throw new Error('Internal Server Error');
    }
  };

export const cancelBooking = async (req: Request, res: Response) => {
    const { id, userid } = req.params; // ID of the vendor space and user ID

    try {
        const vendorSpace = await VendorSpaceModel.findById(id);

        if (!vendorSpace) {
            res.status(404).json({ message: "Vendor space not found" });
           
        }
        else {

            // Check if there are any bookings
            if (!vendorSpace.bookings || vendorSpace.bookings.length === 0) {
                res.status(400).json({ message: "No bookings found for this vendor space" });
                return
            }

            // Find the index of the booking to cancel based on userid
            const bookingIndex = vendorSpace.bookings.findIndex(
                booking => booking.userid === userid
            );

            if (bookingIndex === -1) {
                 res.status(404).json({ message: "Booking not found" });
                 return
            }

            // Remove the booking from the array
            vendorSpace.bookings.splice(bookingIndex, 1);

            // Mark as available if no bookings are left
            if (vendorSpace.bookings.length === 0) {
                vendorSpace.avalablestatus = true;
            }

            await vendorSpace.save();

            res.status(200).json({ message: "Booking canceled successfully", vendorSpace });
        }

    } catch (error) {
        console.error("Error canceling booking:", error);
        res.status(500).json({ message: "An error occurred", error });
    }
};



const putVendorSpace = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updatedVendorSpace = await VendorSpaceModel.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedVendorSpace) {
            res.status(404).json({ message: 'Vendor space not found' });
        }
        else
            res.json(updatedVendorSpace);
    } catch (error) {
        res.status(500).json({ message: 'Error updating vendor space', error });
    }
};

const deleteVendorSpace = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const deletedVendorSpace = await VendorSpaceModel.findByIdAndDelete(id);
        if (!deletedVendorSpace) {
            res.status(404).json({ message: 'Vendor space not found' });
        }
        else
            res.json({ message: 'Vendor space deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting vendor space', error });
    }
};

export { getVendorSpaces, getVendorSpaceById, postVendorSpace, putVendorSpace, deleteVendorSpace, getVendorSpacesByUserId };