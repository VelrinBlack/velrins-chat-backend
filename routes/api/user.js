import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import fs from 'fs';
import ejs from 'ejs';

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

  const numbers = '1234567890';
  let activationCode = '';

  for (let i = 0; i < 5; i++) {
    activationCode += numbers[Math.floor(Math.random() * numbers.length)];
  }

  const user = new User({
    name,
    surname,
    email,
    password: hashedPassword,
    activated: false,
    activationCode,
  });

  try {
    user.save();
  } catch (error) {
    return res.status(500).send('Database error');
  }

  const token = jwt.sign({ email, password }, process.env.JWT_SECRET);

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

  const token = jwt.sign({ email, password }, process.env.JWT_SECRET);
  return res.json({ token });
});

router.post('/authorizate', auth, async (req, res) => {
  const user = await User.findOne({ email: req.body.userEmail });

  if (!user) {
    return res.status(400).send('User not found');
  }

  if (!user.activated) {
    return res.json({
      message: 'User not activated',
      email: user.email,
    });
  }

  return res.json({
    message: 'Authorizated successfully',
  });
});

router.post('/sendmail', auth, async (req, res) => {
  const user = await User.findOne({ email: req.body.userEmail });

  let transporter = await nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  });

  const emailContent = fs.readFileSync('src/mail.ejs', 'utf8');
  const populatedEmailContent = ejs.render(emailContent, {
    userName: user.name,
    activationCode: user.activationCode,
  });

  try {
    await transporter.sendMail({
      from: `Velrin's Chat <${process.env.NODEMAILER_EMAIL}>`,
      to: user.email,
      subject: 'Activate Your account',
      html: populatedEmailContent,
    });
  } catch (err) {
    return res.status(500).send('Internal server error');
  }

  return res.send('Email sent');
});

export default router;
