import bodyParser from "body-parser";
import connectDB from "./config/database";
import express from 'express'
import dbConnection from '../src/config/database';
import routes from '../src/routes/eventRoutes'
import cors from 'cors'

const app = express()
const PORT = 3003
app.use(cors());

dbConnection()
app.use(bodyParser.json())
app.use('/api/v1', routes)

app.listen(PORT , () => {
    console.log(`Server running on port ${PORT}`)
})
