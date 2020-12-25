import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import connectDB from './db.js';
import userRoute from './routes/api/users.js';
import chatRoute from './routes/api/chats.js';

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/users', userRoute);
app.use('/api/chats', chatRoute);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
