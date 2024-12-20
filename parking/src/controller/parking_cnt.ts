import { Request, Response } from "express";
import ParkingSlotModel from "../model/parking_model";
import axios from 'axios'
import { sendParkingEndNotification } from "../config/emailService";

export const getAllParkingSlots = async (req: Request, res: Response): Promise<void> => {
    try {
        const parkingSlots = await ParkingSlotModel.find();
        res.json(parkingSlots);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving parking slots', error });
    }
};

export const postParkingSlot = async (req: Request, res: Response): Promise<void> => {
    try {
        const parkingSlotData = req.body;
        const newParkingSlot = new ParkingSlotModel(parkingSlotData);

        await newParkingSlot.save();
        res.status(201).json({newParkingSlot, message: 'Added successfully'});
    } catch (error: any) {
        if (error.code === 11000) { // MongoDB duplicate key error code
            res.status(400).json({ message: 'Slot number already exists in the block. Please use a unique slot number.' });
        } else {
            res.status(500).json({ message: 'Error creating parking slot', error });
        }
    }
};

export const putParkingSlot = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updatedParkingSlot = await ParkingSlotModel.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedParkingSlot) {
             res.status(404).json({ message: 'Parking slot not found' });
        }
        res.json(updatedParkingSlot);
    } catch (error) {
        res.status(500).json({ message: 'Error updating parking slot', error });
    }
};

export const deleteParkingSlot = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const deletedParkingSlot = await ParkingSlotModel.findByIdAndDelete(id);
        if (!deletedParkingSlot) {
             res.status(404).json({ message: 'Parking slot not found' });
        }
        res.json({ message: 'Parking slot deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting parking slot', error });
    }
};

export const getAvailableParkingSlots = async (req: Request, res: Response): Promise<void> => {
    try {
        const availableSlots = await ParkingSlotModel.find({ available: true });
        res.status(200).json(availableSlots);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving available parking slots', error });
    }
};
export const parkingcountdetails = async (req: Request, res: Response): Promise<void> => {
    try {
        const totalSlots = await ParkingSlotModel.countDocuments();
        const availableCount = await ParkingSlotModel.countDocuments({ available: true });
        const notAvailableCount = await ParkingSlotModel.countDocuments({ available: false });
        const twoWheelerCount = await ParkingSlotModel.countDocuments({ parkingtype: '2wheeler' });
        const fourWheelerCount = await ParkingSlotModel.countDocuments({ parkingtype: '4wheeler' });

        res.json( {
            totalSlots,
            availableCount,
            notAvailableCount,
            twoWheelerCount,
            fourWheelerCount,
        });
    } catch (error) {
        console.error('Error fetching parking counts:', error);
        throw new Error('Internal Server Error');
    }
};

export const bookParkingSlot = async (req: Request, res: Response): Promise<void> => {
    const {  userId, name, vehicalnumber, contact, startTime , _id,endTime} = req.body;

    try {
        // Check if the user exists in the user microservice
        const userResponse = await axios.get(`http://localhost:3001/api/v1/users/${userId}`);
        
        if (userResponse.status !== 200) {
            res.status(400).json({ message: "User not found" });
            return;
        }

        // Check if the parking slot exists and is available
        const slot = await ParkingSlotModel.findById({ _id }); // Fetch by slot_number
        if (!slot) {
            res.status(400).json({ message: "Slot not found" });
            return;
        }
        if (!slot.available) {
            res.status(400).json({ message: "Slot is not available for booking" });
            return;
        }

        // Proceed with booking
        slot.available = false; // Mark the slot as not available
        slot.booking = { userId, name, vehicalnumber, contact, startTime, _id,endTime }; // Use slot_number
        await slot.save();

        res.status(200).json({ message: "Booking successful", slot });
    } catch (error) {
        res.status(500).json({ message: "Error booking parking slot", error });
    }
};


export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        // Find the parking slot by ID
        const slot = await ParkingSlotModel.findById(id);
        if (!slot || !slot.booking) {
             res.status(404).json({ message: "Booking not found for this slot" });
             return;
        }

        // Mark the slot as available and clear the booking
        slot.available = true;
        slot.booking = undefined; // Clear the booking
        await slot.save();

        res.status(200).json({ message: "Booking canceled successfully", slot });
    } catch (error) {
        res.status(500).json({ message: "Error canceling booking", error });
    }
};



export const getParkingDetailsByUserId = async (req: Request, res: Response):Promise<void> => {
    const { userId } = req.params;

    try {
        const slots = await ParkingSlotModel.find({ 'booking.userId': userId });

        if (!slots.length) {
            res.status(404).json({ message: "No bookings found for this user" });
            return;
        }

        res.status(200).json(slots);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving parking details", error });
    }
};

export const getParkingDetailsByslotid = async (req: Request, res: Response):Promise<void> => {
    const { id } = req.params;

    try {
        const slots = await ParkingSlotModel.findById(id);

        if (!slots) {
            res.status(404).json({ message: "No bookings found for this user" });
            return;
        }

        res.status(200).json(slots);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving parking details", error });
    }
};

export const getAvailableSlotsByFloor = async (req: Request, res: Response): Promise<void> => {
    const { floor } = req.params;
    const { parkingtype } = req.query;

    try {
        // Find all available slots on the specified floor and vehicle type
        const query = {
            floor: Number(floor),
            available: true,
            ...( parkingtype && { parkingtype }) // Only include vehicleType if it's provided
        };

        const availableSlots = await ParkingSlotModel.find(query);

        if (availableSlots.length === 0) {
            res.status(404).json({ message: "No available parking slots on this floor for the specified vehicle type." });
        } else {
            res.status(200).json(availableSlots);
        }
    } catch (error) {
        res.status(500).json({ message: "Error retrieving parking slots", error });
    }
};


export const getAllFloors = async (req: Request, res: Response): Promise<void> => {
    try {
        // Get distinct floor numbers from the parking slots where status is true
        const floors = await ParkingSlotModel.distinct("floor", { available: true });

        if (floors.length === 0) {
            res.status(404).json({ message: "No floors found." });
        } else {
            const floorList = floors.map((floor) => ({ floor }));
            res.status(200).json(floorList);
        }
    } catch (error) {
        res.status(500).json({ message: "Error retrieving floors", error });
    }
};

export const getUniqueFloorsByArea = async (req: Request, res: Response): Promise<void> => {
    const area = req.params.area;

    try {
        // Find all parking slots that match the specified area
        const slots = await ParkingSlotModel.find({ area });

        // Extract unique floors from the slots
        const uniqueFloors = Array.from(new Set(slots.map(slot => slot.floor)));

        // Respond with the unique floors
        res.status(200).json({ area, floors: uniqueFloors });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching floors', error });
    }
};

export const getAvailableBlocksByFloorAndArea = async (req: Request, res: Response): Promise<void> => {
    const { area, floor } = req.params;

    try {
        // Find all available parking slots that match the specified area and floor
        const slots = await ParkingSlotModel.find({ area, floor, available: true });

        // Extract unique blocks from the available slots
        const uniqueBlocks = Array.from(new Set(slots.map(slot => slot.block)));

        // Create key-value pairs for the unique blocks
        const blockPairs = uniqueBlocks.reduce((acc, block) => {
            acc[`block_${block}`] = block; // You can customize the key format if needed
            return acc;
        }, {} as Record<string, string>);

        // Respond with the unique blocks in key-value pair format
        res.status(200).json({ area, floor, availableBlocks: blockPairs });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching available blocks', error });
    }
};

export const getSlotsByAreaFloorBlock = async (req: Request, res: Response): Promise<void> => {
    const { area, floor, block } = req.params;

    try {
        // Find all parking slots that match the specified area, floor, and block
        const slots = await ParkingSlotModel.find({ area, floor, block });

        // Check if any slots are found
        if (slots.length === 0) {
            res.status(404).json({ message: 'No parking slots found for the specified criteria' });
            return;
        }

        // Respond with the list of parking slots
        res.status(200).json({ area, floor, block, slots });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching parking slots', error });
    }
};

export const getBlocksByAreaFloorType = async (req: Request, res: Response): Promise<void> => {
    const { area, floor, parkingtype } = req.params;

    try {
        // Query to find all distinct blocks that match the criteria
        const blocks = await ParkingSlotModel.distinct("block", {
            area,
            floor,
            parkingtype,
        });

        // Check if any blocks are found
        if (blocks.length === 0) {
            res.status(404).json({ message: 'No blocks found for the specified criteria' });
            return;
        }

        // Respond with the list of blocks
        res.status(200).json({ area, floor, parkingtype, blocks });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching blocks', error });
    }
};

export const getSlotsByCriteria = async (req: Request, res: Response): Promise<void> => {
    const { area, floor, parkingtype, block } = req.params;

    try {
        // Query to find all slots that match the specified criteria
        const slots = await ParkingSlotModel.find({
            area,
            floor,
            parkingtype,
            block,
        });

        // Check if any slots are found
        if (slots.length === 0) {
            res.status(404).json({ message: 'No slots found for the specified criteria' });
            return;
        }

        // Respond with the list of slots
        res.status(200).json({ area, floor, parkingtype, block, slots });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching slots', error });
    }
};

export const checkAndSendParkingEndEmails = async (req: Request, res: Response) => {
    try {
        // Assuming you have the booking details (userId, slotNumber, endTime) passed in the request body
        const { userId, slotNumber, endTime } = req.body;

        // Make an API call to the user service to fetch the user email using userId
        const userResponse = await axios.get(`http://localhost:3001/api/v1/users/${userId}`);
        const userEmail = userResponse.data.email; // Assuming the response contains the user's email

        // Send the parking end notification to the user
        await sendParkingEndNotification(userEmail, slotNumber, endTime);

        res.status(200).json({ message: 'Parking end notification sent successfully' });
    } catch (error: any) {
        console.error("Error sending parking end notification:", error);
        res.status(500).json({ message: 'Error sending parking end notification', error: error.message });
    }
};