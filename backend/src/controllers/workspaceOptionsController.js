import { getUserWorkspaceOptions } from "../services/workspaceOptionsService.js";

export const getWorkspaceOptions = async (req, res, next) => {
  try {
    const options = await getUserWorkspaceOptions(req.user.id);

    return res.status(200).json({
      success: true,
      ...options,
    });
  } catch (error) {
    next(error);
  }
};
