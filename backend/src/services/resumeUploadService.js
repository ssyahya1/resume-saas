
import { parseResume } from "../services/resumeParserService.js";
import { createUserResume } from "./resumeService.js";
import { createUserResumeVersion } from "./resumeVersionService.js";
import AppError from "../utils/appError.js";

export const createResumeFromUpload = async({
    userId,file,title
})=>{
    if(!file){
        throw new AppError("Resume File is required", 400)
    };

    const text = await parseResume(file);
    if(!text || !text.trim()){
        throw new AppError("Could not extract resume text", 400)
    };

    const resume = await createUserResume({
        userId,title
    });

    const version = await createUserResumeVersion({
        resumeId:resume.id,
        userId,
        content:{
            RawText:text
        }
    })
    return{
        resume,version
    }
}