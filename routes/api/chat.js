import express from 'express';
import Pusher from 'pusher';

import Chat from '../../models/Chat.js';
import auth from '../../middlewares/auth.js';

const router = express.Router();

const pusher = new Pusher({
  appId: '1124642',
  key: 'ed13948a7c4618e48dbc',
  secret: '2dc7743929626c29eb5a',
  cluster: 'us3',
  useTLS: true,
});

router.get('/getAll', auth, async (req, res) => {
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

router.post('/createMessage', auth, async (req, res) => {
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
