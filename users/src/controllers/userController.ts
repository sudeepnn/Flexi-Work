import { Request, RequestHandler, Response } from "express";
import User, { IUser } from "../model/user";
import jwt,{JwtPayload} from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import axios from "axios";
import cloudinary from "../config/cloudConfig";
import nodemailer from 'nodemailer'
import transporter from "../config/emailConfig";

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
    res.status(500).json({ message: "Server error. Please try again later.",err });
  }
};



export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { user_id, password } = req.body;

  if (!user_id || !password ) {
    res.status(400).json({ message: "Username, password are required" });
    return;
  }

  try {
    const user = await User.findOne({ user_id });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // if (user.role !== role) {
    //   res.status(403).json({ message: "Invalid role selected" });
    //   return;
    // }

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

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { user_id } = req.body;

  try {
    const user = await User.findOne({ user_id });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET as string, { expiresIn: '2m' });
    const resetLink = `http://localhost:3004/reset-password/${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email, // Send to user's email found from user_id
      subject: 'Password Reset Request',
      html: `<p>To reset your password, please click the following link:</p><a href="${resetLink}">Reset Password</a>`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Password reset link sent to your email." });
  } catch (error) {
    console.error("Error in forgot password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;
  const { newPassword } = req.body;

  // Define a regular expression for password validation
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  // Check if the new password meets the requirements
  if (!passwordRegex.test(newPassword)) {
    res.status(400).json({ 
      message: "Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 8 characters long." 
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    const userId = (decoded as JwtPayload).userId;

    const user = await User.findOne({ user_id: userId });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password has been updated." });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Invalid or expired token" });
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
export const getEmployees = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;  // default to page 1
  const limit = parseInt(req.query.limit as string) || 10;  // default to 10 items per page

  try {
    const employees = await User.find({ role: "employee" })
      .skip((page - 1) * limit)
      .limit(limit);
    
    const totalEmployees = await User.countDocuments({ role: "employee" });
    const totalPages = Math.ceil(totalEmployees / limit);

    res.json({
      data: employees,
      currentPage: page,
      totalPages,
      totalEmployees
    });
  } catch (err) {
    res.status(500).send("Error fetching employees");
  }
};

export const getTotalCounts = async (req: Request, res: Response): Promise<void> => {
  try {
    // Count total employees
    const totalEmployees = await User.countDocuments({ role: "employee" });
    
    // Count total managers
    const totalManagers = await User.countDocuments({ role: "manager" });

    // Respond with counts
    res.json({
      totalEmployees,
      totalManagers
    });
  } catch (err) {
    res.status(500).send("Error fetching counts");
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

    // Initialize empty results with default messages
    let parkingDetails = { message: "No parking bookings yet" };
    let feedbackDetails = { message: "No feedback found" };
    let workspaceDetails = { message: "No workspace bookings yet" };
    let eventDetails = { message: "No event registrations yet" };

    // Fetch related information with individual try-catch for each service
    try {
      const parkingDetailsResponse = await axios.get(`http://localhost:3000/api/v1/parking/${user_id}`);
      parkingDetails = parkingDetailsResponse.data;
    } catch (error:any) {
      console.warn("Parking service error:", error.message);
    }

    try {
      const feedbackDetailsResponse = await axios.get(`http://localhost:3002/api/v1/feedback/user/${user_id}`);
      feedbackDetails = feedbackDetailsResponse.data;
    } catch (error:any) {
      console.warn("Feedback service error:", error.message);
    }

    try {
      const workspaceDetailsResponse = await axios.get(`http://localhost:3005/api/v1/workspaceBooking/${user_id}`);
      workspaceDetails = workspaceDetailsResponse.data;
    } catch (error:any) {
      console.warn("Workspace service error:", error.message);
    }

    try {
      const eventDetailsResponse = await axios.get(`http://localhost:3003/api/v1/event/registered/${user_id}`);
      eventDetails = eventDetailsResponse.data;
    } catch (error:any) {
      console.warn("Event service error:", error.message);
    }

    // Respond with all the gathered information
    res.status(200).json({
      message: "Employee dashboard data retrieved successfully",
      parkingDetails,
      feedbackDetails,
      workspaceDetails,
      eventDetails
    });
  } catch (err) {
    console.error("Error retrieving employee dashboard data:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateEmployeeDetails = async (req: Request, res: Response): Promise<void> => {
  const { user_id, isOndcMember, project, manager, profileImage, address, phone} = req.body;

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
    user.address = address;
    user.phone=phone
    user.profileImage = profileImage;
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

export const updateProfileImage = async (req: Request, res: Response): Promise<void> => {
  const profileImageFile = req.file;

  if (!profileImageFile) {
    res.status(400).json({ message: 'No image file uploaded' });
    return;
  }

  try {
    // Upload to Cloudinary using buffer
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'profile_images', public_id: `user_${req.body.user_id}` },
        (error, result) => {
          if (error) {
            console.error('Error uploading to Cloudinary:', error);
            return reject(error);
          }
          resolve(result);
        }
      );
      stream.end(profileImageFile.buffer);
    });

    // Get the secure URL from Cloudinary response
    const profileImageUrl = (result as any).secure_url; // Type assertion for TypeScript

    res.status(200).json({ message: 'Profile image updated successfully', profileImageUrl });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    res.status(500).json({ message: 'Failed to upload profile image', error });
  }
};



