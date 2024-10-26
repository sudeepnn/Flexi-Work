import express from "express";
import userRoutes from "./routes/route";
import dbconnection from './config/database';
import bodyParser from "body-parser";

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(bodyParser.json());
app.use("/api", userRoutes);

dbconnection();

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
