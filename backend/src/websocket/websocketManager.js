const connectedUsers = new Map();

export const addUserSocket = (userId, socket) => {
  if (!connectedUsers.has(userId)) {
    connectedUsers.set(userId, new Set());
  }

  connectedUsers.get(userId).add(socket);
};

export const removeUserSocket = (userId, socket) => {
  const userSockets = connectedUsers.get(userId);

  if (!userSockets) {
    return;
  }

  userSockets.delete(socket);

  if (userSockets.size === 0) {
    connectedUsers.delete(userId);
  }
};

export const getUserSockets = (userId) => {
  return connectedUsers.get(userId) || new Set();
};

export const sendToUser = (userId, message) => {
  const userSockets = getUserSockets(userId);

  if (userSockets.size === 0) {
    return false;
  }

  const messageString = JSON.stringify(message);

  let sent = false;

  for (const socket of userSockets) {
    if (socket.readyState === 1) {
      socket.send(messageString);
      sent = true;
    }
  }

  return sent;
};