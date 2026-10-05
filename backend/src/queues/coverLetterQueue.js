import {Queue} from 'bullmq';


const connection  = {
  url: process.env.REDIS_URL || "redis://localhost:6379",
};

export const coverLetterQueue = new Queue("cover-letter", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 100,
  },
});
