const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  surname: String,
  email: String,
  password: String,
  image: {
    type: String,
    default: '',
  },
  activated: Boolean,
  activationCode: String,
  verificationEmailSent: Boolean,
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
