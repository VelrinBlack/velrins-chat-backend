import express from 'express';

import connectDB from './db.js';
import userRoute from './routes/api/user.js';

connectDB();

const app = express();
app.use(express.json());

app.use('/api/user', userRoute);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
