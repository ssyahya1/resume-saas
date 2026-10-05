import redisClient from "../config/redis.js";

const RATE_LIMIT = 10;
const WINDOW_SECONDS = 15 * 60;
const INCREMENT_WITH_EXPIRATION = `
  local current = redis.call("INCR", KEYS[1])

  if current == 1 then
    redis.call("EXPIRE", KEYS[1], ARGV[1])
  end

  return current
`;

const authRateLimitMiddleware = async (req, res, next) => {
  try {
    const key = `auth-rate-limit:${req.ip}`;
    const requests = await redisClient.eval(
      INCREMENT_WITH_EXPIRATION,
      {
        keys: [key],
        arguments: [String(WINDOW_SECONDS)],
      }
    );

    if (requests > RATE_LIMIT) {
      return res.status(429).json({
        success: false,
        message: "Too many authentication requests. Please try again later.",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default authRateLimitMiddleware;
