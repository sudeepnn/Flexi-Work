import { Request, Response } from "express";
import ParkingSlotModel from "../model/parking_model";
import axios from 'axios'

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

export const bookParkingSlot = async (req: Request, res: Response): Promise<void> => {
    const {  userId, name, vehicalnumber, contact, startTime , slot_number} = req.body;

    try {
        // Check if the user exists in the user microservice
        const userResponse = await axios.get(`http://localhost:3001/api/v1/users/${userId}`);
        
        if (userResponse.status !== 200) {
            res.status(400).json({ message: "User not found" });
            return;
        }

        // Check if the parking slot exists and is available
        const slot = await ParkingSlotModel.findOne({ slot_number }); // Fetch by slot_number
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
        slot.booking = { userId, name, vehicalnumber, contact, startTime, slot_number: slot.slot_number }; // Use slot_number
        await slot.save();

        res.status(200).json({ message: "Booking successful", slot });
    } catch (error) {
        res.status(500).json({ message: "Error booking parking slot", error });
    }
};


export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
    const { slotId } = req.params;

    try {
        // Find the parking slot by ID
        const slot = await ParkingSlotModel.findById(slotId);
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