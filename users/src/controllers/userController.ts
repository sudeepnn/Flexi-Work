import { Request, RequestHandler, Response } from "express";
import User, { IUser } from "../model/user";

export const registerUser  = async (req : Request, res : Response) :Promise<void> => {
  const { user_id, password, email, first_name, last_name, phone, address, role } = req.body;
  try {
    const user = new User({ user_id, password, email, first_name, last_name, phone, address, role });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
      res.status(500).send(err);
  }
};

export const getAllUsers = async (_: Request, res: Response) : Promise<void> => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).send("Error fetching users");
  }
};

export const getUserById= async (req: Request, res: Response) : Promise<void> => {
  const user = await User.findById(req.params.id);
  if (!user) res.status(404).send("User not found");
  res.json(user);
};

export const updateUser = async (req: Request, res: Response) : Promise<void> => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) res.status(404).send("User not found");
    res.json(user);
  } catch (err) {
    res.status(500).send("Error updating user");
  }
};


export const deleteUser = async (req: Request, res: Response) : Promise<void> => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) res.status(404).send("User not found");
  res.json({ message: "User deleted successfully" });
};

