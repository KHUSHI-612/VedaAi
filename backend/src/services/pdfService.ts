import PDFDocument from 'pdfkit';
import { IAssessment } from '../models/Assessment';

/**
 * Generates a beautifully formatted PDF question paper from a completed MongoDB Assessment document.
 * Returns a Promise that resolves to a binary Buffer suitable for file saving or HTTP stream delivery.
 */
export const generatePDF = (assessment: IAssessment): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];

      // Collect streamed pdf data chunks into a buffer array
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // 1. Header Section
      doc.fontSize(20).font('Helvetica-Bold').fillColor('#1e293b').text(assessment.title.toUpperCase(), { align: 'center' });
      doc.moveDown(0.4);

      // School info/meta layout (2-column style representation)
      const initialY = doc.y;
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#334155');
      doc.text(`Subject: `, 50, initialY, { continued: true }).font('Helvetica').text(assessment.subject);
      doc.font('Helvetica-Bold').text(`Class: `, { continued: true }).font('Helvetica').text(assessment.className);
      
      const rightColX = 350;
      doc.font('Helvetica-Bold').text(`Total Questions: `, rightColX, initialY, { continued: true }).font('Helvetica').text(`${assessment.numQuestions}`);
      if (assessment.dueDate) {
        doc.font('Helvetica-Bold').text(`Date: `, rightColX, doc.y, { continued: true }).font('Helvetica').text(new Date(assessment.dueDate).toLocaleDateString());
      }
      doc.moveDown(1.5);

      // 2. Student Info Section (Name, Roll No, Section lines)
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#475569');
      doc.text('STUDENT INFORMATION:', 50, doc.y, { underline: true });
      doc.moveDown(0.4);
      doc.font('Helvetica').fillColor('#000000');
      doc.text('Name: ________________________     Roll No: ____________     Section: _________');
      doc.moveDown(1.2);

      // Divider Line
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#cbd5e1').lineWidth(1).stroke();
      doc.moveDown(1.5);

      // 3. Render Sections & Questions
      if (assessment.result && assessment.result.sections && assessment.result.sections.length > 0) {
        assessment.result.sections.forEach((section, sIdx) => {
          // Section Title
          doc.fontSize(13).font('Helvetica-Bold').fillColor('#0f172a').text(section.name.toUpperCase());
          if (section.instructions) {
            doc.fontSize(9.5).font('Helvetica-Oblique').fillColor('#475569').text(section.instructions, { lineGap: 2 });
          }
          doc.moveDown(0.8);

          // Questions loop
          section.questions.forEach((q, qIdx) => {
            const currentY = doc.y;
            // Write question text
            doc.fontSize(10.5).font('Helvetica').fillColor('#000000')
               .text(`${qIdx + 1}.  ${q.text}`, 50, currentY, { width: 400, lineGap: 4 });

            // MCQ Options
            if (q.options && q.options.length > 0) {
              doc.moveDown(0.4);
              q.options.forEach((opt) => {
                doc.fontSize(10).font('Helvetica').fillColor('#334155').text(`     [  ]  ${opt}`, { lineGap: 3 });
              });
            }

            // Difficulty & Marks right-aligned metadata
            doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#64748b')
               .text(`[Difficulty: ${q.difficulty} | Marks: ${q.marks}]`, 420, currentY, { align: 'right' });
            
            doc.moveDown(1.2);
          });
          
          doc.moveDown(1.5);
        });
      } else {
        doc.fontSize(12).font('Helvetica-Oblique').fillColor('#64748b').text('No structured questions available for this paper.', { align: 'center' });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
