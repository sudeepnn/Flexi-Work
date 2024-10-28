import mongoose from "mongoose";

const dbConnection = async () => {
    try {
      await mongoose.connect('mongodb://127.0.0.1:27017/feedback');
      console.log('MongoDB connected');
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  };
    
export default dbConnection;
