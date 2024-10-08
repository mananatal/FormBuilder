import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app=express();

app.use(express.json({limit:"20kb"}));
app.use(urlencoded({extended:true,limit:"20kb"}));
app.use(cookieParser());
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true,
}));

//importing routes
import userRouter from "./routes/user.route.js";
import formRouter from "./routes/form.route.js";

app.use("/api/v1/auth",userRouter);
app.use("api/v1/form",formRouter);

export {app}