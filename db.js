import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(
      'mongodb+srv://velrinblack:x934BIais1Kldg69@cluster0.2c6h8.mongodb.net/Cluster0?retryWrites=true&w=majority',
      { useNewUrlParser: true, useUnifiedTopology: true },
    );
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

export default connectDB;
