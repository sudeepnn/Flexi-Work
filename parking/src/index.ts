import express from "express";
import { router } from "./routes/routes";
import dbconnection from "./config/db";
import bodyParser from "body-parser";

import cors from 'cors'
import { checkAndSendParkingEndEmails } from "./controller/parking_cnt";
import cron from 'node-cron'

const app = express();
const port=3000
app.use(bodyParser.json());
app.use(cors())
dbconnection()
app.use('/api/v1',router )
app.use(express.json())
app.use(cors())

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});

// cron.schedule('* * * * *', () => {
//     checkAndSendParkingEndEmails({} as any, {} as any);
// });
