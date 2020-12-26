const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const connectDB = require('./db.js');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/users', require('./routes/api/users.js'));
app.use('/api/chats', require('./routes/api/chats.js'));

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
