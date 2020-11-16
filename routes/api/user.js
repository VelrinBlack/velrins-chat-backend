import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import User from '../../models/User.js';
import auth from '../../middlewares/auth.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, surname, email, password } = req.body;

  if (!name || !surname || !email || !password) {
    return res.status(400).send('Invalid parameters');
  }

  if (await User.findOne({ email })) {
    return res.send('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 6);

  const user = new User({
    name,
    surname,
    email,
    password: hashedPassword,
    activated: false,
  });

  try {
    user.save();
  } catch (error) {
    return res.status(500).send('Database error');
  }

  const token = jwt.sign({ email, password }, 'velrins-secret');

  return res.json({ token });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Invalid parameters');
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.send('Invalid email or password');
  }

  const correctPassword = await bcrypt.compare(password, user.password);

  if (!correctPassword) {
    return res.send('Invalid email or password');
  }

  const token = jwt.sign({ email, password }, 'velrins-secret');
  return res.json({ token });
});

router.post('/authorizate', auth, async (req, res) => {
  const user = await User.findOne({ email: req.body.userEmail });

  if (!user) {
    return res.status(400).send('User not found');
  }

  if (!user.activated) {
    return res.send('User is not activated');
  }

  return res.send('Authorizated successfully');
});

export default router;
