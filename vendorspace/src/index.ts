import express from "express";
import { router } from "./routes/routes";
import dbconnection from "./config/db";
import bodyParser from "body-parser";
import cors from 'cors'
const app = express();
const port=3008
app.use(bodyParser.json());

dbconnection()

app.use(express.json())
app.use(cors())

app.use('/api/v1',router )

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});
