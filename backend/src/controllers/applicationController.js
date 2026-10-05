import{
    createUserApplication,
    getUserApplications,
    getUserApplicationById,
    updateUserApplication,
    deleteUserApplication,

} from "../services/applicationService.js";


export const createApplication = async (req,res,next) =>{
   try{
    const{jobId,resumeId,status,appliedAt}=req.body;

    const application = await createUserApplication({
        userId:req.user.id,
        jobId,
        resumeId,
        status,
        appliedAt

    });
    res.status(201).json({
        success:true,
        message:"Application Created Successfully",
        application
    });

   }catch(error){
    next(error);
   }

};

export const getApplications = async(req,res,next)=>{
    try{
        const { page, limit, status } = req.validated.query;

        const result = await getUserApplications(req.user.id, {
            page,
            limit,
            status,
        });

        res.status(200).json({
            success:true,
            ...result
        });


    }catch(error){
        next(error);
    }
};


export const getApplication = async(req,res,next)=>{
    try{
    const {id}= req.params;

    const application = await getUserApplicationById({
        applicationId:id,
        userId:req.user.id,
    });

    res.status(200).json({
        success:true,
        application
    });
    }catch(error){
        next(error);
    }
};

export const updateApplication = async(req,res,next)=>{
    try{
        const{id} = req.params;
        const{status,appliedAt}= req.body;

        const application = await updateUserApplication({
            applicationId: id,
            userId:req.user.id,
            status,
            appliedAt
    });
    res.status(200).json({
        success:true,
        message:"Application Updated Successfully",
        application,
    });

    }catch(error){
        next(error);
    }
};


export const deleteApplication = async(req,res,next)=>{
    try{
        const {id}=req.params;


        await deleteUserApplication({
            applicationId:id,
            userId:req.user.id,
    });

    res.status(200).json({
        success:true,
        message:"Application Deleted Successfully",

    });

    }catch(error){
        next(error);
    }

};