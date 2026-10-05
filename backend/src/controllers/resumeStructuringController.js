import {structureUserResume} from "../services/resumeStructuringService.js";

export const structureResume = async(req,res,next) =>{
    try{
        const{resumeId,versionId}= req.params;

        const result = await structureUserResume({
            resumeId,
            versionId,
            userId:req.user.id
        });
        return res.status(200).json({
            success:true,
            message:"Resume Structured Successfully",
            version:result

        });
    }catch(error){
        next(error)
    };
};