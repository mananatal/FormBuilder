import { app } from "./app.js";
import { dbConnect } from "./db/dbConnect.js";
import dotenv from "dotenv";

dotenv.config()
const PORT=process.env.PORT || 4000

dbConnect().then(()=>{
    app.listen(PORT ,()=>{
        console.log("Server is Up and Running on Port: ",PORT);
    })
}).catch((error)=>{
    console.log("OOPS! Can't connect to MONGODB: ",error)
})