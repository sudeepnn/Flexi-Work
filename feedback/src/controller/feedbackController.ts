import { RequestHandler } from 'express';
import Feedback from "../model/feedback";
import {Request, Response} from 'express';

export const submitFeedback = async (req:Request, res: Response) : Promise<void> => {
  const { userId, type, message } = req.body;
  try {
    const feedback = new Feedback({ userId, type, message });
    await feedback.save();
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).send(err);
  }
};

export const getFeedbackByUser = async (req: Request, res: Response) : Promise<void> => {
    try {
      const feedbacks = await Feedback.find({ userId: req.params.userId });
      res.json(feedbacks);
    } catch (err) {
      res.status(500).send("Error fetching feedback by user");
    }
  };

  export const getFeedbackByType = async (req: Request, res: Response) : Promise<void> => {
    try {
      const feedbacks = await Feedback.find({ type: req.params.type });
      res.json(feedbacks);
    } catch (err) {
      res.status(500).send("Error fetching feedback by type");
    }
  };

  export const getAllFeedback = async (req : Request, res: Response) : Promise<void> => {
    try {
      const feedbacks = await Feedback.find();
      res.json(feedbacks);
    } catch (err) {
      res.status(500).send("Error fetching all feedback");
    }
  };

  export const getFeedbackById = async (req: Request, res: Response) : Promise<void> => {
    try {
      const feedback = await Feedback.findById(req.params.feedbackId);
      if (!feedback)  res.status(404).send("Feedback not found");
      res.json(feedback);
    } catch (err) {
      res.status(500).send("Error fetching feedback by ID");
    }
  };

  
