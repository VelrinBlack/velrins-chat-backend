const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const User = require('../../models/User.js');
const auth = require('../../middlewares/auth.js');
const {
  generateActivationCode,
  generateVerificationMailContent,
} = require('../../utilities/user.js');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, surname, email, password } = req.body;

  if (!name || !surname || !email || !password) {
    return res.status(400).json({ info: 'Invalid parameters' });
  }

  if (await User.findOne({ email })) {
    return res.status(409).json({ info: 'User already exists' });
  }

  const user = new User({
    name,
    surname,
    email,
    password: await bcrypt.hash(password, 6),
    activated: false,
    activationCode: generateActivationCode(),
    verificationEmailSent: false,
  });

  try {
    user.save();
  } catch (error) {
    return res.status(500).json({ info: 'Database error' });
  }

  const token = jwt.sign({ email, id: user.id }, process.env.JWT_SECRET);

  return res.status(201).json({ info: 'User registered successfully', token });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ info: 'Invalid parameters' });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ info: 'Invalid email or password' });
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    return res.status(401).json({ info: 'Invalid email or password' });
  }

  const token = jwt.sign({ email, id: user.id }, process.env.JWT_SECRET);

  return res.status(200).json({ info: 'Logged in successfully', token });
});

router.post('/authorizate', auth, async (req, res) => {
  const user = await User.findOne({ email: req.body.user.email });

  if (!user) {
    return res.status(400).json({ info: 'User not found' });
  }

  if (!user.activated) {
    return res.status(403).json({
      info: 'User not activated',
      email: user.email,
    });
  }

  return res.status(200).json({
    info: 'Authorizated successfully',
  });
});

router.post('/send-verification-mail', auth, async (req, res) => {
  const user = await User.findOne({ email: req.body.user.email });

  if (!user) {
    return res.status(400).json({ info: 'User not found' });
  }

  if (user.verificationEmailSent && !req.body.force) {
    return res.status(409).json({ info: 'Email already sent' });
  }

  let transporter = await nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: `Velrin's Chat <${process.env.NODEMAILER_EMAIL}>`,
      to: user.email,
      subject: 'Activate Your account',
      html: generateVerificationMailContent(user),
    });
  } catch (err) {
    return res.status(500).json({ info: 'Internal server error' });
  }

  user.verificationEmailSent = true;

  try {
    await user.save();
  } catch (error) {
    return res.status(500).json({ info: 'Database error' });
  }

  return res.send('Email sent');
});

router.patch('/activate', auth, async (req, res) => {
  const user = await User.findOne({ email: req.body.user.email });

  if (!user) {
    return res.status(400).json({ info: 'User not found' });
  }

  const code = req.body.code;

  if (!code) {
    return res.status(400).json({ info: 'Activation code not provided' });
  }

  if (code !== user.activationCode) {
    return res.status(401).json({ info: 'Invalid verification code' });
  }

  try {
    user.activated = true;
    user.save();
  } catch (error) {
    return res.status(500).json({ info: 'Database error' });
  }

  return res.status(200).json({
    info: 'User activated successfully',
  });
});

router.get('/getOne', auth, async (req, res) => {
  const user = await User.findById(req.body.user.id);

  const { name, surname, email, image, _id } = user;
  return res.status(200).json({ user: { name, surname, email, image, id: _id } });
});

router.put('/updateOne', auth, async (req, res) => {
  const { id, name, surname, image } = req.body;

  if (!id || !name || !surname) {
    return res.status(400).json({ info: 'Invalid parameters' });
  }

  try {
    await User.findByIdAndUpdate(id, { name, surname, image });
  } catch (err) {
    return res.status(500).json({ info: 'Database error' });
  }

  return res.status(200).send({ info: 'User updated successfully' });
});

module.exports = router;
