import { RequestHandler } from 'express';
import { FeedbackModel, ResponseModel } from '../model/feedback';
import {Request, Response} from 'express';
import axios from 'axios';

const allowedTypes = ['praise', 'complaint', 'help', 'others']; // Allowed types

export const submitFeedback = async (req: Request, res: Response): Promise<void> => {
  const { user_id, type, message } = req.body;
  
  try {
    // Validate feedback type
    if (!allowedTypes.includes(type)) {
      res.status(400).json({ error: `Invalid feedback type. Allowed types are: ${allowedTypes.join(', ')}` });
      return;
    }

    // Verify if user exists in the user database
    console.log("Checking user existence with user ID:", user_id);
    const userResponse = await axios.get(`http://localhost:3001/api/v1/users/${user_id}`);
    
    if (userResponse.status === 200 && userResponse.data) {
      console.log("User verified. Proceeding to save feedback...");
      
      // Save the feedback
      const feedback = new FeedbackModel({ user_id, type, message });
      const savedFeedback = await feedback.save();

      console.log("Feedback saved successfully:", savedFeedback);
      res.status(201).json(savedFeedback);
    } else {
      console.error("User not found in user service.");
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      console.error("User not found during Axios request.");
      res.status(404).json({ error: 'User not found' });
    } else {
      console.error("Unexpected error:", err);
      res.status(500).json({ error: 'An error occurred while submitting feedback' });
    }
  }
};

export const getFeedbackByUser = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params; // Get userId from request parameters

  try {
    // Fetch feedbacks for the given userId
    const feedbacks = await FeedbackModel.find({ user_id: userId }); // Make sure to match the field in your schema

    if (feedbacks.length === 0) {
      res.status(404).json({ message: 'No feedback found for this user' });
      return;
    }

    res.status(200).json(feedbacks); // Respond with the feedbacks found
  } catch (err) {
    console.error("Error fetching feedback:", err);
    res.status(500).json({ error: "Error fetching feedback by user" });
  }
};

  export const getFeedbackByType = async (req: Request, res: Response) : Promise<void> => {
    try {
      const feedbacks = await FeedbackModel.find({ type: req.params.type });
      res.json(feedbacks);
    } catch (err) {
      res.status(500).send("Error fetching feedback by type");
    }
  };

  export const getAllFeedback = async (req : Request, res: Response) : Promise<void> => {
    try {
      const feedbacks = await FeedbackModel.find();
      res.json(feedbacks);
    } catch (err) {
      res.status(500).send("Error fetching all feedback");
    }
  };

  export const getFeedbackById = async (req: Request, res: Response) : Promise<void> => {
    try {
      const feedback = await FeedbackModel.findById(req.params.feedbackId);
      if (!feedback)  res.status(404).send("Feedback not found");
      res.json(feedback);
    } catch (err) {
      res.status(500).send("Error fetching feedback by ID");
    }
  };

  export const respondToFeedback = async (req: Request, res: Response): Promise<void> => {
    const { feedbackId } = req.params;
    const { message, respondedBy } = req.body;
  
    try {
      // Create a new response and save it
      const newResponse = new ResponseModel({
        feedbackId,
        message,
        respondedBy,
      });
  
      await newResponse.save();
  
      // Update the feedback with the new response
      const updatedFeedback = await FeedbackModel.findByIdAndUpdate(
        feedbackId,
        {
          $push: { responses: newResponse }, // Add response to the array
          respondedByAdmin: true,
        },
        { new: true }
      );
  
      if (!updatedFeedback) {
         res.status(404).json({ error: 'Feedback not found' });
      }
  
      res.status(200).json(updatedFeedback);
    } catch (error) {
      console.error("Error responding to feedback:", error);
      res.status(500).json({ error: 'An error occurred while responding to feedback' });
    }
  };
  
