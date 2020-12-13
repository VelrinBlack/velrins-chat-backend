import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import connectDB from './db.js';
import userRoute from './routes/api/user.js';
import chatRoute from './routes/api/chat.js';

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/user', userRoute);
app.use('/api/chat', chatRoute);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
