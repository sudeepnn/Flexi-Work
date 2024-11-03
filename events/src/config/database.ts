import mongoose from 'mongoose';


const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://sudeep2002naik:Hello123@cluster0.ct290.mongodb.net/event');
    console.log('MongoDB connected');
  } catch (error) {
    console.error(error);
  }
};

export default connectDB;
