import express from "express";
import { router } from "./routes/routes";
import dbconnection from "./config/db";
import bodyParser from "body-parser";
import cors from 'cors'
import dotenv from 'dotenv';

dotenv.config()
const app = express();
const port=3005
app.use(bodyParser.json());
app.use(cors())
dbconnection()
app.use('/api/v1',router )
app.use(express.json())

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});
