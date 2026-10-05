import redisClient from "../config/redis.js";

const RATE_LIMIT = 10;
const WINDOW_SECONDS = 5 * 60;
const INCREMENT_WITH_EXPIRATION = `
  local current = redis.call("INCR", KEYS[1])

  if current == 1 then
    redis.call("EXPIRE", KEYS[1], ARGV[1])
  end

  return current
`;

const rateLimitMiddleware = (type) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const key = `rate-limit:${type}:${userId}`;

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
          message: `Too many ${type} requests. Please try again later.`,
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default rateLimitMiddleware;