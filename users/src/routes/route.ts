import { Router } from "express";
import { deleteUser, getAllUsers, getEmployeeDashboard, getUserById, loginUser, registerUser, updateEmployeeDetails, updateProfileImage, updateUser } from "../controllers/userController";
import { upload } from "../multer/multerConfig";


const router = Router();

router.post("/users/register", registerUser);
router.post("/users/login", loginUser)
router.get("/users", getAllUsers);
router.get("/users/:user_id", getUserById);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.put("/user/update-user", updateEmployeeDetails)
router.get("/users/dashboard/:user_id", getEmployeeDashboard)
router.post('/update-profile-image', upload.single('profileImage'), updateProfileImage);


export default router;
