import { createResumeFromUpload } from "../services/resumeUploadService.js";

export const uploadResume = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const file = req.file;
    const { title } = req.body;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Resume file is required",
      });
    }

    const result = await createResumeFromUpload({
      userId,
      file,
      title,
    });

    return res.status(201).json({
      message: "Resume upload successfully",
      success: true,
      result,
    });
  } catch (error) {
    next(error);
  }
};