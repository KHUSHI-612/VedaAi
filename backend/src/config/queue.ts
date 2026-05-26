import { Queue } from 'bullmq';
import { getRedis } from './redis';

const connection = getRedis();

/**
 * BullMQ Queue for orchestrating asynchronous assessment generation jobs.
 * Uses the connection configuration exported from the shared Redis client.
 */
export const assessmentQueue = new Queue('assessmentQueue', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true, // Automatically cleans up successful jobs from Redis memory
    removeOnFail: false,    // Retains failed jobs in history for inspection
  },
});
