import express from 'express';

import Chat from '../../models/Chat.js';
import auth from '../../middlewares/auth.js';

const router = express.Router();

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

export default router;
