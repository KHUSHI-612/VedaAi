import { Worker, Job } from 'bullmq';
import { getRedis } from '../config/redis';
import { Assessment } from '../models/Assessment';

const connection = getRedis();

/**
 * BullMQ Worker listening to the 'assessmentQueue'.
 * Performs asynchronous AI question generation and updates database status.
 */
export const assessmentWorker = new Worker(
  'assessmentQueue',
  async (job: Job) => {
    console.log(`[Worker] Received job ${job.id} to process. Data:`, job.data);

    const { assessmentId } = job.data;
    if (!assessmentId) {
      console.error(`[Worker] Job ${job.id} is missing 'assessmentId' in its payload.`);
      throw new Error("Missing required field 'assessmentId' in job data.");
    }

    try {
      // 1. Update the status of the Assessment document in MongoDB to 'processing'
      const assessment = await Assessment.findByIdAndUpdate(
        assessmentId,
        { status: 'processing' },
        { new: true }
      );

      if (!assessment) {
        console.error(`[Worker] Assessment with ID ${assessmentId} was not found in the database.`);
        throw new Error(`Assessment with ID ${assessmentId} not found.`);
      }

      console.log(`[Worker] Set assessment ${assessmentId} status to 'processing'.`);

      // TODO: Call Groq AI service, generate question paper, update MongoDB with results, and notify via WebSockets.

    } catch (error) {
      console.error(`[Worker] Failed to process job ${job.id}:`, error);
      
      // Update assessment status to 'failed' in the database on error
      await Assessment.findByIdAndUpdate(assessmentId, { status: 'failed' }).catch((dbErr) => {
        console.error(`[Worker] Failed to update assessment status to 'failed' in DB:`, dbErr);
      });

      throw error;
    }
  },
  {
    connection,
    concurrency: 2, // concurrency limit for parallel job processing
  }
);

// Event listener logs for worker lifecycle
assessmentWorker.on('active', (job) => {
  console.log(`[Worker] Job ${job.id} is now active.`);
});

assessmentWorker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed successfully.`);
});

assessmentWorker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed. Error:`, err);
});
