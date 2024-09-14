import { Schema } from "mongoose";


const fieldSchema=new Schema({
    label:{
        type:String,
        require:true,
        trim:true
    },
    required:{
        type:Boolean,
        default:true,
    },
    fieldType:{
        type:String,
        require:true,
        enum:['text', 'number', 'radio', 'checkbox', 'dropdown']
    },
    name:{
        type:String,
        require:true,
        trim:true
    },
    validation:{
        type:String,
        trim:true
    },
    options:{
        type:[String]
    },
    placeholder:{
        type:String,
        trim:true
    }
});


const formSchema=new Schema({
    title:{
        type:String,
        require:true,
        trim:true
    },
    description:{
        type:String,
        trim:true
    },
    fields:[fieldSchema],
    createdBy:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

export const Form=module.exports("Form",formSchema);