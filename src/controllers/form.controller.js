import  {User}  from "../models/User.model.js";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Form } from "../models/form.model.js";
import { FormSubmission } from "../models/formSubmission.model.js";
import ExcelJS from 'exceljs';

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
    const {formId}=req.params;

    if(!req.user._id){
        throw new ApiError(401,"Unauthorized Access");
    }
    
    if(!formId){
        throw new ApiError(404,"FormId missing")
    }

    const responses=await FormSubmission.find({formId});

    if(!responses.length){
        return res.status(200).json(new ApiResponse(200,[],"No responses for the form yet"));
    }

    return res.status(200).json(new ApiResponse(200,responses,"Form Responses fetched successfully"));

});

const exportResponses=asyncHandler(async (req,res)=>{
    const {formId}=req.body;

    if(!formId){
        throw new ApiError(404,"FormId missing");
    }

    const form=await Form.findById(formId);
    if(!form){
        throw new ApiError(401,"No form found for given formId");
    }

    const submissions=await FormSubmission.find({formId});
    if(!submissions.length){
        throw new ApiError(404,"No submissions found for given form");
    }

    //creating workbook and worksheet for given form
    const workbook=new ExcelJS.Workbook();
    const worksheet=workbook.addWorksheet(`${form.title} Responses`);

    //adding headers(form fields) to the worksheet
    const headers=form.fields.map((field)=>field.label);
    headers.push("Submitted At");

    worksheet.addRow(headers);

    //adding row data
    submissions.forEach((submission)=>{
        const row=[];
        form.fields.forEach((field)=>{
            row.push(submission.response[field.name] || "");
        })
        row.push(submission.createdAt);
        worksheet.addRow(row);
    })

    res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
        'Content-Disposition',
        `attachment; filename="${form.title}-responses.xlsx"`
    );

    // Write the Excel file to the response stream
    await workbook.xlsx.write(res);

    res.status(200).end();

});

export{
    createForm,
    getUserForms,
    getAllFormResponses,
    submitFormResponse,
    exportResponses
}