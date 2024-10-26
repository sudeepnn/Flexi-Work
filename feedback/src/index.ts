import express from 'express';
import bodyParser from 'body-parser';
import dbConnection from './config/database'
import routes from './routes/feedbackRoutes'

const app = express();
app.use(bodyParser.json());
const PORT = 3002;

dbConnection();

app.use('/api',routes)

app.listen(PORT , () => {
    console.log(`Server running on port ${PORT}`);
})

