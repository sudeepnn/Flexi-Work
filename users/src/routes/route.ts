import { Router } from "express";
import { deleteUser, getAllUsers, getEmployeeDashboard, getUserById, loginUser, registerUser, updateUser } from "../controllers/userController";


const router = Router();

router.post("/users/register", registerUser);
router.post("/users/login", loginUser)
router.get("/users", getAllUsers);
router.get("/users/:user_id", getUserById);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.get("/users/dashboard/:user_id", getEmployeeDashboard)

export default router;
