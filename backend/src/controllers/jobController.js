import{
    createUserJob,
    getUserJobs,
    getUserJobById,
    updateUserJob,
    deleteUserJob,

} from "../services/jobService.js";

export const createJob = async (req,res,next) =>{
   try{
    const{title,companyName,description,jobUrl}=req.body;

    const job = await createUserJob({
        userId:req.user.id,
        title,
        companyName,
        description,
        jobUrl,

    });
    res.status(201).json({
        success:true,
        message:"Job Created Successfully",
        job
    });

   }catch(error){
    next(error);
   }

};
export const getJobs = async (req, res, next) => {
  try {
    const { page, limit,  } = req.validated.query;

    const result = await getUserJobs(req.user.id, {
      page,
      limit,

    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};


export const getJob = async(req,res,next)=>{
    try{
    const {id}= req.params;

    const job = await getUserJobById({
        jobId:id,
        userId:req.user.id,
    });

    res.status(200).json({
        success:true,
        job
    });
    }catch(error){
        next(error);
    }
};

export const updateJob = async(req,res,next)=>{
    try{
        const{id} = req.params;
        const{title,companyName,description,jobUrl}= req.body;

        const job = await updateUserJob({
            jobId: id,
            userId:req.user.id,
            title,
            companyName,
            description,
            jobUrl,
    });
    res.status(200).json({
        success:true,
        message:"Job Updated Successfully",
        job,
    });

    }catch(error){
        next(error);
    }
};


export const deleteJob = async(req,res,next)=>{
    try{
        const {id}=req.params;


        await deleteUserJob({
            jobId:id,
            userId:req.user.id,
    });

    res.status(200).json({
        success:true,
        message:"Job Deleted Successfully",

    });

    }catch(error){
        next(error);
    }

};