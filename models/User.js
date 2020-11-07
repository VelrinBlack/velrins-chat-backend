import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: String,
  surname: String,
  email: String,
  password: String,
  activated: {
    type: Boolean,
    default: false,
  },
});

const User = mongoose.model('User', UserSchema);

export default User;
