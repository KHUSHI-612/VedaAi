import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Ensure the root uploads/ directory exists safely
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer storage to create uniquely-named files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${fileExtension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file limit constraint
});

/**
 * POST /api/upload
 * Process a single file upload under the form-data key "file",
 * saves it inside the uploads directory, and returns the public relative path.
 */
router.post('/', upload.single('file'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Please upload a file under field key "file".' });
    }

    const relativePath = `/uploads/${req.file.filename}`;

    res.status(200).json({
      message: 'File uploaded successfully.',
      filePath: relativePath,
      fileName: req.file.originalname,
      fileSize: req.file.size,
    });
  } catch (error: any) {
    console.error('Error handling file upload:', error);
    res.status(500).json({ error: error.message || 'File upload failed.' });
  }
});

export default router;
