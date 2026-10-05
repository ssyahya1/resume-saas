import { Queue } from "bullmq";

const connection = {
  url: process.env.REDIS_URL || "redis://localhost:6379",
};

export const resumeTailoringQueue = new Queue(
  "resume-tailoring",
  {
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
  }
);