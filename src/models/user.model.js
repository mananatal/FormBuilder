import {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema=new Schema({
    username:{
        type:String,
        require:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        require:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    password:{
        type:String,
        require:[true,"Password is Required"],
    },
    fullName:{
        type:String,
        require:true,
        trim:true,
    },
    refreshToken:{
        type:String,
    },
    formsCreated:[{
        type:Schema.Types.ObjectId,
        ref:"Form"
    }],
    isVerified:{
        type:Boolean,
        default:false
    },
    verifyCode:{
        type:String,
        required: [true, "Verify Code is required"],
    },
    verifyCodeExpiry:{
        type:Date,
        required: [true, 'Verify Code Expiry is required'],
    }
},{timestamps:true});

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();

    this.password=await bcrypt.hash(this.password,10);
    next();
});

userSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken=function(){
    const payload={
        _id:this._id,
        email:this.email,
        username:this.username,
    }

    return jwt.sign(payload,process.env.ACCESS_TOKEN_SECRET,{expiresIn:process.env.ACCESS_TOKEN_EXPIRE_TIME});
}

userSchema.methods.generateRefreshToken=function(){
    const payload={
        _id:this._id,
    }

    return jwt.sign(payload,process.env.REFRESH_TOKEN_SECRET,{expiresIn:process.env.REFRESH_TOKEN_EXPIRE_TIME});
}

export const User=mongoose.model("User",userSchema);