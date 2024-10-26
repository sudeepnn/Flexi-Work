import bodyParser from "body-parser";
import connectDB from "./config/database";
import express from 'express'
import dbConnection from '../src/config/database';
import routes from '../src/routes/eventRoutes'

const app = express()
const PORT = 3003

dbConnection()
app.use(bodyParser.json())
app.use('/api', routes)

app.listen(PORT , () => {
    console.log(`Server running on port ${PORT}`)
})
