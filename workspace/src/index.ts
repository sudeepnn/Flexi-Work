import express from "express";
import { router } from "./routes/routes";
import dbconnection from "./config/db";
import bodyParser from "body-parser";
const app = express();
const port=3005
app.use(bodyParser.json());

dbconnection()
app.use('/api/',router )
app.use(express.json())

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});
