import { Schema } from "mongoose";

const formSubmissionSchema=new Schema({
    formId:{
        type:Schema.Types.ObjectId,
        ref:"Form",
        require:true
    },
    response:{
        type:Object,
        require:true
    },
    submittedBy:{
        type:Schema.Types.ObjectId,
        ref:"User",
        require:true
    }
},{timestamps:true});


const FormSubmission=module.exports("FormSubmission",formSubmissionSchema);