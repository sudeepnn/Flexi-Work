import express from 'express';
import bodyParser from 'body-parser';
import dbConnection from './config/database'
import routes from './routes/feedbackRoutes'
import cors from 'cors'

const app = express();
app.use(bodyParser.json());
app.use(cors())
const PORT = 3002;

dbConnection();

app.use('/api/v1',routes)

app.listen(PORT , () => {
    console.log(`Server running on port ${PORT}`);
})

