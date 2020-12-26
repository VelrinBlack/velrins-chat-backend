import express from 'express';
import Pusher from 'pusher';

import Chat from '../../models/Chat.js';
import User from '../../models/User.js';
import auth from '../../middlewares/auth.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  const chats = await Chat.find({ users: { _id: req.body.user.id } }).populate('users');

  if (!chats) {
    return res.status(204).json({ chats });
  }

  for (let chat of chats) {
    for (let user of chat.users) {
      user.password = undefined;
      user.activated = undefined;
      user.activationCode = undefined;
      user.verificationEmailSent = undefined;
      user.__v = undefined;
    }
  }

  return res.status(200).json({ chats });
});

router.post('/', auth, async (req, res) => {
  if (!req.body.email) {
    return res.status(400).json({ info: 'Invalid parameters' });
  }

  const user1 = await User.findOne({ email: req.body.user.email });
  if (!user1) {
    return res.status(500).json({ info: 'Internal server error' });
  }

  const user2 = await User.findOne({ email: req.body.email });
  if (!user2) {
    return res.status(400).json({ info: 'Invalid email' });
  }

  const chat = new Chat({
    users: [user1._id, user2._id],
    messages: [],
  });

  try {
    chat.save();
  } catch (error) {
    return res.status(500).json({ info: 'Database error' });
  }

  return res.status(201).json({
    users: [
      {
        _id: user1._id,
        name: user1.name,
        surname: user1.surname,
        email: user1.email,
      },
      {
        _id: user2._id,
        name: user2.name,
        surname: user2.surname,
        email: user2.email,
      },
    ],
    messages: [],
  });
});

router.post('/message', auth, async (req, res) => {
  const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: 'us3',
    useTLS: true,
  });

  const { chatId, userId, content } = req.body;

  if (!chatId || !userId || !content) {
    return res.status(400).json({ info: 'Invalid parameters' });
  }

  const time = new Date();

  pusher.trigger('messages', 'send-message', {
    chatId,
    message: { user: userId, content, time },
  });

  try {
    await Chat.findByIdAndUpdate(chatId, {
      $push: {
        messages: { user: userId, content, time },
      },
    });
  } catch (err) {
    return res.status(500).json({ info: 'Database error' });
  }

  res.status(200).send({ info: 'Message sent successfully' });
});

export default router;
