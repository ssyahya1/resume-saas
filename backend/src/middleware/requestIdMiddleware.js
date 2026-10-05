import crypto from "crypto";

const requestIdMiddleware = (req, res, next) => {
  const requestId =
    req.headers["x-request-id"] || crypto.randomUUID();

  req.requestId = requestId;

  res.setHeader("X-Request-ID", requestId);

  next();
};

export default requestIdMiddleware;