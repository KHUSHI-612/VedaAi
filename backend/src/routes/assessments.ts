import { Router, Request, Response } from 'express';
import { Assessment } from '../models/Assessment';
import { assessmentQueue } from '../config/queue';
import { emitToClient } from '../config/websocket';
import { generatePDF } from '../services/pdfService';

const router = Router();

/**
 * POST /api/assessments
 * Creates a new assessment config record, enqueues the AI generation job,
 * and emits a 'job:queued' event via WebSocket.
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      title,
      subject,
      className,
      dueDate,
      questionTypes,
      numQuestions,
      marksPerQuestion,
      difficulty,
      instructions,
    } = req.body;

    // Create MongoDB Assessment record with 'pending' status
    const assessment = new Assessment({
      title,
      subject,
      className,
      dueDate,
      questionTypes,
      numQuestions,
      marksPerQuestion,
      difficulty,
      instructions,
      status: 'pending',
    });

    await assessment.save();

    // Add job to BullMQ queue for async processing
    const job = await assessmentQueue.add('generate-assessment', {
      assessmentId: assessment._id.toString(),
    });

    // Save job ID reference
    assessment.jobId = job.id;
    await assessment.save();

    // Trigger websocket queued notification
    emitToClient(assessment._id.toString(), 'job:queued', assessment);

    res.status(201).json(assessment);
  } catch (error: any) {
    console.error('Error creating assessment:', error);
    res.status(500).json({ error: error.message || 'Failed to initiate assessment creation.' });
  }
});

/**
 * GET /api/assessments
 * Retrieves all assessments from MongoDB, sorted by newest first.
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const assessments = await Assessment.find().sort({ createdAt: -1 });
    res.status(200).json(assessments);
  } catch (error: any) {
    console.error('Error listing assessments:', error);
    res.status(500).json({ error: error.message || 'Failed to list assessments.' });
  }
});

/**
 * GET /api/assessments/:id
 * Retrieves a single assessment with generated outputs by Mongo ID.
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const assessment = await Assessment.findById(id);

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found.' });
    }

    res.status(200).json(assessment);
  } catch (error: any) {
    console.error('Error fetching assessment detail:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch assessment detail.' });
  }
});

/**
 * GET /api/assessments/:id/pdf
 * Generates and downloads the assessment question paper as a beautifully formatted PDF.
 */
router.get('/:id/pdf', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const assessment = await Assessment.findById(id);

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found.' });
    }

    if (assessment.status !== 'completed') {
      return res.status(400).json({ error: 'Assessment question paper generation is not completed yet.' });
    }

    console.log(`[Router] Generating PDF for completed assessment ${id}...`);
    const pdfBuffer = await generatePDF(assessment);

    // Sanitize title to use in filename
    const safeTitle = assessment.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}-${id}.pdf"`);
    res.send(pdfBuffer);
  } catch (error: any) {
    console.error('Error generating assessment PDF:', error);
    res.status(500).json({ error: error.message || 'Failed to generate PDF.' });
  }
});

/**
 * POST /api/assessments/:id/regenerate
 * Re-enqueues AI generation for an existing assessment configuration.
 */
router.post('/:id/regenerate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const assessment = await Assessment.findById(id);

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found.' });
    }

    // Set status to pending
    assessment.status = 'pending';
    assessment.result = undefined; // clear old results
    await assessment.save();

    // Re-add to BullMQ queue
    const job = await assessmentQueue.add('generate-assessment', {
      assessmentId: assessment._id.toString(),
    });

    assessment.jobId = job.id;
    await assessment.save();

    // Trigger websocket queued notification
    emitToClient(assessment._id.toString(), 'job:queued', assessment);

    res.status(200).json(assessment);
  } catch (error: any) {
    console.error('Error regenerating assessment:', error);
    res.status(500).json({ error: error.message || 'Failed to re-trigger generation.' });
  }
});

/**
 * DELETE /api/assessments/:id
 * Deletes a specific assessment permanently from the database.
 */
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const assessment = await Assessment.findByIdAndDelete(req.params.id);
    if (!assessment) {
      res.status(404).json({ error: 'Assessment not found' });
      return;
    }
    res.status(200).json({ message: 'Assessment deleted successfully', id: req.params.id });
  } catch (error: any) {
    console.error('Error deleting assessment:', error);
    res.status(500).json({ error: 'Failed to delete assessment' });
  }
});

export default router;
