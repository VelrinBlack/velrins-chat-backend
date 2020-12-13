import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  messages: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      content: String,
      time: Date,
    },
  ],
});

const Chat = mongoose.model('Chat', ChatSchema);

export default Chat;
