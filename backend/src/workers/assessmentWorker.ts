import { Worker, Job } from 'bullmq';
import { getRedis } from '../config/redis';
import { Assessment } from '../models/Assessment';
import { generateQuestions } from '../services/aiService';

const connection = getRedis();

/**
 * BullMQ Worker listening to the 'assessmentQueue'.
 * Processes background AI question generation jobs, updates Mongo status, and saves results.
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

    // 1. Get the assessment from MongoDB using the ID from job data
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      console.error(`[Worker] Assessment with ID ${assessmentId} was not found in the database.`);
      throw new Error(`Assessment with ID ${assessmentId} not found.`);
    }

    try {
      // 2. Update status to 'processing'
      assessment.status = 'processing';
      await assessment.save();
      console.log(`[Worker] Updated assessment status to 'processing' for ID: ${assessmentId}`);

      // 3. Call generateQuestions using the assessment document configuration
      console.log(`[Worker] Requesting Groq AI question generation for assessment: ${assessmentId}...`);
      const aiResult = await generateQuestions({
        title: assessment.title,
        subject: assessment.subject,
        className: assessment.className,
        questionTypes: assessment.questionTypes,
        numQuestions: assessment.numQuestions,
        marksPerQuestion: assessment.marksPerQuestion,
        difficulty: assessment.difficulty,
        instructions: assessment.instructions,
      });

      // 4. Map the Groq AI JSON structure safely to fit Mongoose schema ('title' -> 'name')
      const mappedSections = aiResult.sections.map((section: any) => ({
        name: section.title || section.name || 'Section',
        instructions: section.instructions || '',
        questions: (section.questions || []).map((q: any) => ({
          text: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer || '',
          marks: q.marks || assessment.marksPerQuestion || 1,
          difficulty: q.difficulty || assessment.difficulty || 'medium',
        })),
      }));

      // 5. Save the generated sections result and update status to 'completed'
      assessment.result = { sections: mappedSections };
      assessment.status = 'completed';
      await assessment.save();
      console.log(`[Worker] Successfully completed job and saved assessment results for ID: ${assessmentId}`);

    } catch (error) {
      console.error(`[Worker] Failed to process job ${job.id}:`, error);

      // 6. On error, update the assessment status to 'failed' in MongoDB
      try {
        assessment.status = 'failed';
        await assessment.save();
        console.log(`[Worker] Updated assessment status to 'failed' for ID: ${assessmentId}`);
      } catch (dbErr) {
        console.error(`[Worker] Failed to update assessment status to 'failed' in DB:`, dbErr);
      }

      throw error;
    }
  },
  {
    connection,
    concurrency: 2,
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
