import { Request, RequestHandler, Response } from "express";
import User, { IUser } from "../model/user";
import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";


export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { user_id, password, email, name, phone, address, role } = req.body;

  const validRoles = ["employee", "vendor", "manager", "security"];
  if (!validRoles.includes(role)) {
    res.status(400).json({ message: "Invalid role" });
    return; 
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({ message: "Password must have at least one lowercase, one uppercase, one number, and be at least 8 characters long." });
    return; 
  }

  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(phone)) {
    res.status(400).json({ message: "Phone number must be 10 digits." });
    return; 
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ user_id, password: hashedPassword, email, name, phone, address, role });
    await user.save();
    res.status(201).json(user); 
    return; 
  } catch (err) {
    res.status(500).send(err); 
    return; 
  }
};


export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { user_id, password, role } = req.body;

  if (!user_id || !password || !role) {
    res.status(400).json({ message: "Username, password, and role are required" });
    return;
  }

  try {
    const user = await User.findOne({ user_id });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (user.role !== role) {
      res.status(403).json({ message: "Invalid role selected" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid password" });
      return;
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      role: user.role // Include the role in the response
    });
  } catch (err) {
    console.error("Login error:", err); 
    res.status(500).json({ message: "Internal server error" });
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

