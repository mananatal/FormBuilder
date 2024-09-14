const asyncHandler=(requestHandler)=>{
    return (req,res,next)=>{
        Promise.reject(requestHandler(req,res,next)).catch((error)=>next(error));
    }
}

export {asyncHandler};