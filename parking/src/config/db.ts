import mongoose from "mongoose";

function dbconnection(){
    mongoose.connect('mongodb+srv://sudeep2002naik:Hello123@cluster0.ct290.mongodb.net/parking').then((result) => {
        console.log("connected successfully")
    }).catch((err) => {
        console.log("error", err);
    });
}

export default dbconnection;