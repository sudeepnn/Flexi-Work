import mongoose from "mongoose";

const dbConnection = async () => {
    try {
      await mongoose.connect('mongodb+srv://sudeep2002naik:Hello123@cluster0.ct290.mongodb.net/feedback');
      console.log('MongoDB connected');
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  };
    
export default dbConnection;
