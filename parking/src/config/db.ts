import mongoose from "mongoose";

function dbconnection(){
    mongoose.connect('mongodb://127.0.0.1:27017/parking').then((result) => {
        console.log("connected successfully")
    }).catch((err) => {
        console.log("error", err);
    });
}

export default dbconnection;