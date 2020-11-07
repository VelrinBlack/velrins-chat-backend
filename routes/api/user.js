import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import User from '../../models/User.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, surname, email, password } = req.body;

  if (!name || !surname || !email || !password) {
    return res.status(400).send('Invalid parameters');
  }

  if (await User.findOne({ email })) {
    return res.status(400).send('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 6);

  const user = new User({
    name,
    surname,
    email,
    password: hashedPassword,
  });

  try {
    user.save();
  } catch (error) {
    return res.status(500).send('Database error');
  }

  const token = jwt.sign({ name, surname, email, password }, 'velrins-secret');

  res.json({ token });
});

export default router;
