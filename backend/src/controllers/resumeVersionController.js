import {
  createUserResumeVersion,
  getUserResumeVersions,
  getUserResumeVersionById,
} from "../services/resumeVersionService.js";

export const createVersion = async (req, res, next) => {
  try {
    const { resumeId } = req.params;
    const { content } = req.body;

    const version = await createUserResumeVersion({
      resumeId,
      userId: req.user.id,
      content,
    });

    res.status(201).json({
      success: true,
      message: "Resume version created successfully",
      version,
    });
  } catch (error) {
    next(error);
  }
};

export const getVersions = async (req, res, next) => {
  try {
    const { resumeId } = req.params;
    const { page, limit } = req.validated.query;

    const result = await getUserResumeVersions({
      resumeId,
      userId: req.user.id,
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

export const getVersion = async (req, res, next) => {
  try {
    const { resumeId, versionId } = req.params;

    const version = await getUserResumeVersionById({
      resumeId,
      versionId,
      userId: req.user.id,
    });

    res.status(200).json({
      success: true,
      version,
    });
  } catch (error) {
    next(error);
  }
};