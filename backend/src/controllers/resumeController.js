import {
  createUserResume,
  getUserResumes,
  getUserResumeById,
  updateUserResume,
  deleteUserResume
} from "../services/resumeService.js";

export const createResume = async (req, res, next) => {
  try {
    const { title } = req.body;

    const resume = await createUserResume({
      userId: req.user.id,
      title,
    });

    res.status(201).json({
      success: true,
      message: "Resume created successfully",
      resume,
    });
  } catch (error) {
    next(error);
  }
};
export const getResumes = async (req, res, next) => {
  try {
    const { page, limit } = req.validated.query;

    const result = await getUserResumes(req.user.id, {
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
export const getResume = async (req, res, next) => {
  try {
    const { id } = req.params;

    const resume = await getUserResumeById({
      resumeId: id,
      userId: req.user.id,
    });

    res.status(200).json({
      success: true,
      resume,
    });
  } catch (error) {
    next(error);
  }
};
export const updateResume = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const resume = await updateUserResume({
      resumeId: id,
      userId: req.user.id,
      title,
    });

    res.status(200).json({
      success: true,
      message: "Resume updated successfully",
      resume,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteResume = async (req, res, next) => {
  try {
    const { id } = req.params;

    await deleteUserResume({
      resumeId: id,
      userId: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};