import { getWorkspaceOptionsByUserId } from "../repositories/workspaceOptionsRepository.js";

export const getUserWorkspaceOptions = async (userId) => {
  return getWorkspaceOptionsByUserId(userId);
};
