import { Request, Response } from "express";
import ParkingSlotModel from "../model/parking_model";

const getParkingSlots = async (req: Request, res: Response): Promise<void> => {
    try {
        const parkingSlots = await ParkingSlotModel.find();
        res.json(parkingSlots);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving parking slots', error });
    }
};

const postParkingSlot = async (req: Request, res: Response): Promise<void> => {
    try {
        const parkingSlotData = req.body;
        const newParkingSlot = new ParkingSlotModel(parkingSlotData);
        await newParkingSlot.save();
        res.status(201).json(newParkingSlot);
    } catch (error) {
        res.status(500).json({ message: 'Error creating parking slot', error });
    }
};

const putParkingSlot = async (req: Request, res: Response): Promise<void> => {
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

const deleteParkingSlot = async (req: Request, res: Response): Promise<void> => {
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

export { getParkingSlots, postParkingSlot, putParkingSlot, deleteParkingSlot };
