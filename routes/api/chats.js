import express from 'express';
import Pusher from 'pusher';

import Chat from '../../models/Chat.js';
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
