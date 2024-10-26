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

const payBill = async (req: Request, res: Response): Promise<void> => {
  try {
      const { id } = req.params;
      const bookingData = req.body;

      // Find the vendor space by ID and add the new booking
      const updatedVendorSpace = await VendorSpaceModel.findByIdAndUpdate(
          id,
          { $push: { bookings: bookingData } },
          { new: true }
      );

      if (!updatedVendorSpace) {
           res.status(404).json({ message: "Vendor space not found" });
      }
      else
      res.json(updatedVendorSpace);
  } catch (error) {
      res.status(500).json({ message: "Error adding booking", error });
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

export { getVendorSpaces,getVendorSpaceById, postVendorSpace, putVendorSpace, deleteVendorSpace,payBill };