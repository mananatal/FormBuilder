import  {User}  from "../models/User.model.js";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import bcrypt from "bcrypt";
import { sendMail } from "../utils/mailSender.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const options={
    httpOnly:true,
    secure:true,
}


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

        const newUser=new User({
            username,
            email,
            password,
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


const loginUser=asyncHandler(async (req,res)=>{
    const {email,username,password}=req.body;

    if(!(username || email) || !password){
        throw new ApiError(404,"Missing Fields");
    }

    const existedUser=await User.findOne({$or:[{email},{username}]});

    if(!existedUser){
        throw new ApiError(404,"User Not found, Please create an account first");
    }

    if(!existedUser.isVerified){
        throw new ApiError(403,"Please Verify your account before login");
    }

    const isPasswordCorrect=await existedUser.isPasswordCorrect(password);
    if(!isPasswordCorrect){
        throw new ApiError(400,"Please Enter correct password");
    }

    const accessToken=existedUser.generateAccessToken();
    const refreshToken=existedUser.generateRefreshToken();

    existedUser.refreshToken=refreshToken;
    await existedUser.save({validateBeforeSave:false});

    existedUser.password=undefined;
    existedUser.refreshToken=undefined;

    return res
            .cookie("token",accessToken,options)
            .cookie("refreshToken",refreshToken,options)
            .status(200)
            .json(new ApiResponse(200,{existedUser,token:accessToken},"User Login Successfuly"))

});


const logoutUser=asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken:1
            }
        },
        {
            new:true
        }
    );

    return res
            .status(200)
            .clearCookie("accessToken",options)
            .clearCookie("refreshToken",options)            
            .json(new ApiResponse(200,{},"User logged out successfully"));
});

const refreshAccessToken=asyncHandler(async (req,res)=>{
    const refreshToken=req.cookies.refreshToken || req.body.refreshToken;

    if(!refreshToken){
        throw new ApiError(401,"Unauthorized Access");
    }

    try {   
        const decodedToken=jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET);

        if(!decodedToken){
            throw new ApiError(401,"Invalid Token");
        }

        const user=await User.findById(decodedToken._id);
        if(!user){
            throw new ApiError(400,"User not found for given token");
        }

        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();
    
        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false});

        return res.status(200)
               .cookie("accessToken",accessToken,options)
               .cookie("refreshToken",refreshToken,options)
               .json(
                new ApiResponse(200,{refreshToken,accessToken},"Access Token Refreshed Successfully")
               );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}