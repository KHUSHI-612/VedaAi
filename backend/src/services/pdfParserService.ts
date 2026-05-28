import fs from 'fs';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse') as (buffer: Buffer) => Promise<{ text: string }>;

/**
 * Reads a PDF file from the local disk and extracts all text content.
 * @param filePath Absolute path to the PDF file.
 * @returns The extracted raw text string.
 */
export async function parsePDFText(filePath: string): Promise<string> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`PDF file not found at path: ${filePath}`);
  }

  const dataBuffer = fs.readFileSync(filePath);
  const parsedData = await pdfParse(dataBuffer);
  return parsedData.text || '';
}
