import mongoose from "mongoose";

export const dbConnect=async ()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URL);
    } catch (error) {
        console.log("OOPS! COULD NOT CONNECT TO DB",error);
        process.exit(1);
    }
}