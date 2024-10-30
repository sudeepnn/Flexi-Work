import { Request, RequestHandler, Response } from "express";
import User, { IUser } from "../model/user";
import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import axios from "axios";

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { user_id, password, email, name, phone, address, role } = req.body;

  const validRoles = ["employee", "vendor", "manager", "security"];
  if (!validRoles.includes(role)) {
    res.status(400).json({ message: "Invalid role" });
    return;
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({
      message: "Password must have at least one lowercase, one uppercase, one number, and be at least 8 characters long.",
    });
    return;
  }

  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(phone)) {
    res.status(400).json({ message: "Phone number must be 10 digits." });
    return;
  }

  try {
    // Check if user_id already exists
    const existingUserById = await User.findOne({ user_id });
    if (existingUserById) {
      res.status(400).json({ message: "User ID already exists." });
      return;
    }

    // Check if email already exists
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      res.status(400).json({ message: "Email already exists." });
      return;
    }

    // Hash the password before saving the user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ user_id, password: hashedPassword, email, name, phone, address, role });
    
    // Save the new user to the database
    await user.save();

    // Respond with the created user details (excluding the password)
    res.status(201).json({ 
      user
    });

  } catch (err) {
    res.status(500).json({ message: "Server error. Please try again later." });
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
      { userId: user.user_id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: "Login successful",
      id:user.user_id,
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

export const getUserById = async (req: Request, res: Response) : Promise<void>=> {
  const { user_id } = req.params;

  try {
    const user = await User.findOne({ user_id });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user', error });
  }
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

export const getEmployeeDashboard = async (req: Request, res: Response): Promise<void> => {
  const { user_id } = req.params; // Get user_id from the request parameters

  try {
    // Find the user by user_id
    const user = await User.findOne({ user_id });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Check if user is an employee
    if (user.role !== "employee") {
      res.status(403).json({ message: "Access denied: Only employees can view this dashboard" });
      return;
    }

    // Use Axios to fetch related information
    const parkingDetailsPromise = axios.get(`http://localhost:3000/api/parking/${user_id}`);
    const feedbackDetailsPromise = axios.get(`http://localhost:3002/api/feedback/user/${user_id}`);
    //const registeredEventsPromise = axios.get(`http://your-events-service-url/api/events/user/${user_id}`);

    // Wait for all requests to complete
    const [parkingDetailsResponse, feedbackDetailsResponse] = await Promise.all([
      parkingDetailsPromise,
      feedbackDetailsPromise,
      //registeredEventsPromise,
    ]);

    res.status(200).json({
      message: "Employee dashboard data retrieved successfully",
      parkingDetails: parkingDetailsResponse.data,
      feedbackDetails: feedbackDetailsResponse.data,
      //registeredEvents: registeredEventsResponse.data,
    });
  } catch (err) {
    console.error("Error retrieving employee dashboard data:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateEmployeeDetails = async (req: Request, res: Response): Promise<void> => {
  const { user_id, isOndcMember, project, manager } = req.body;

  try {
    // Find the employee by user_id
    const user = await User.findOne({ user_id });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Confirm that the user has an employee role
    if (user.role !== "employee") {
      res.status(403).json({ message: "Access denied: Only employees can update these details" });
      return;
    }

    // Update ONDC details, converting ondc string to boolean
    user.isOndcMember = isOndcMember;
    if (user.isOndcMember) {
      user.project = project;
      user.manager = manager;
    } else {
      user.project = null; 
      user.manager=null; 
    }

    await user.save();

    res.status(200).json({ message: "Details updated successfully", user });
  } catch (err) {
    console.error("Error updating employee details:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

