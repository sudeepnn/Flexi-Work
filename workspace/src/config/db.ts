import mongoose from "mongoose";

function dbconnection(){
    mongoose.connect('mongodb://localhost:27017/flexiwork').then((result) => {
        console.log("connected successfully")
    }).catch((err) => {
        console.log("error", err);
    });
}

export default dbconnection;