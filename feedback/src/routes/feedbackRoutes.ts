import { Router } from "express";
import {
  submitFeedback,
  getFeedbackByUser,
  getFeedbackByType,
  getAllFeedback,
  getFeedbackById
} from "../controller/feedbackController";

const router = Router();

router.post("/feedback", submitFeedback);
router.get("/feedback/user/:userId", getFeedbackByUser);
router.get("/feedback/type/:type", getFeedbackByType);
router.get("/feedback", getAllFeedback);
router.get("/feedback/:feedbackId", getFeedbackById);

export default router;
