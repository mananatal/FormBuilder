import  {User}  from "../models/User.model.js";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Form } from "../models/form.model.js";
import { FormSubmission } from "../models/formSubmission.model.js";


const createForm=asyncHandler(async (req,res)=>{
    const {title,description,fields}=req.body;

    if(!title || !description || !fields){
        throw new ApiError(400,"Some fields are missing");
    }

    const createdForm=await Form.create({
        title,
        description,
        fields,
        createdBy:req.user?._id
    });

    if(!createdForm){
        throw new ApiError(500,"Error while creating form");
    }

    return res.status(200).json(new ApiResponse(200,{createdForm},"Form created successfully"));
});

const getUserForms=asyncHandler(async (req,res)=>{
    if(!req.user?._id){
        throw new ApiError("401","Unauthorized Access");
    }

    const forms=await Form.find({_id:req.user._id});

    return res.status(200).json(new ApiResponse(200,{forms},"Forms Fetched successfully"));
});

const submitFormResponse=asyncHandler(async (req,res)=>{
    const {formId,response}=req.body;

    if(!formId || !response){
        throw new ApiError(404,"Some fields are missing");
    }

    const submittedResponse=await FormSubmission.create({
        formId,
        response
    });

    if(!submittedResponse){
        throw new ApiError(500,"Error while submitting form responses");
    }

    return res.status(200).json(new ApiResponse(200,submittedResponse,"Form submitted successfully"));
});

const getAllFormResponses=asyncHandler(async (req,res)=>{
    const {formId}=req.body;

    if(!req.user._id){
        throw new ApiError(401,"Unauthorized Access");
    }

    const responses=await FormSubmission.find({formId});

    if(!responses){
        return res.status(200).json(new ApiResponse(200,[],"No responses for the form yet"));
    }

    return res.status(200).json(new ApiResponse(200,responses,"Form Responses fetched successfully"));

});



export{
    createForm,
    getUserForms,
    getAllFormResponses,
    submitFormResponse
}