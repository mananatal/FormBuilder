import  {User}  from "../models/User.model.js";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import bcrypt from "bcrypt";
import { sendMail } from "../utils/mailSender.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser=asyncHandler(async (req,res)=>{
    const {username,email,password,fullName}=req.body;

    if(!username || !email || !password || !fullName){
        throw new ApiError(404,"Missing Fields");
    }

    const existedUserVerifiedByUsername=await User.findOne({username,isVerified:true});
    const verificationCode=Math.floor(Math.random()*800000+100000).toString();

    if(existedUserVerifiedByUsername){
        throw new ApiError(400,"User Already registered, Username not available");
    }

    const existedUserByEmail=await User.findOne({email});

    if(existedUserByEmail){
        if(existedUserByEmail.isVerified){
            throw new ApiError(400,"User Already registered,Please login");
        }
        else{
            const verifyCodeExpiry=new Date(Date.now()+24*60*60*1000);
            const hashedPassword=await bcrypt.hash(password,10);
            existedUserByEmail.password=hashedPassword;
            existedUserByEmail.verifyCode=verificationCode;
            existedUserByEmail.verifyCodeExpiry=verifyCodeExpiry;
            await existedUserByEmail.save();
        }
    }
    else{
        const verifyCodeExpiry=new Date(Date.now()+24*60*60*1000);
        const hashedPassword=await bcrypt.hash(password,10);
        const newUser=new User({
            username,
            email,
            password:hashedPassword,
            verifyCode:verificationCode,
            verifyCodeExpiry:verifyCodeExpiry,
            isVerified:false,
            fullName
        });
        await newUser.save();
    }

    //sending OTP
    const mailResponse=await sendMail(email,"Verification OTP",`<h1>Verification Code: ${verificationCode}</h1>`);

    if(!mailResponse){
        throw new ApiError(500,"Error while Sending verification mail to user");
    }

    return res.status(200).json(new ApiResponse(200,{},"User Registered Successfully, Please Verify Your Account to login"));  

});