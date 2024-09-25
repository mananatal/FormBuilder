import { User } from "../models/User.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";


export const verifyJWT=asyncHandler(async (req,res)=>{
    try {
        const accesstoken=req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ","");
    
        if(!accesstoken){
            throw new ApiError(404,"Access Token not found");
        }
    
        const decodedToken=jwt.verify(accesstoken,process.env.ACCESS_TOKEN_SECRET);
    
        const user=await User.findById(decodedToken?._id).select("-password -refreshToken");
    
        req.user=user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
})
