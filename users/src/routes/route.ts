import { Router } from "express";
import { deleteUser, getAllUsers, getUserById, registerUser, updateUser } from "../controllers/userController";

const router = Router();

router.post("/register", registerUser);
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

export default router;
