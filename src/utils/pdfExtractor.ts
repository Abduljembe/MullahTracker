import * as pdfjsLib from 'pdfjs-dist';
// Vite URL worker import
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Initialize PDF.js worker
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
  } catch {
    // fallback to cdn worker if local worker fails
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  }
}

export class PdfPasswordRequiredError extends Error {
  isIncorrect: boolean;
  constructor(message = 'Password required to unlock PDF statement', isIncorrect = false) {
    super(message);
    this.name = 'PdfPasswordRequiredError';
    this.isIncorrect = isIncorrect;
  }
}

export interface ExtractedPdfResult {
  text: string;
  pageCount: number;
  fileName: string;
  fileSizeBytes: number;
}

/**
 * Extracts all readable text from a PDF file (supporting password-protected Safaricom statements)
 */
export async function extractTextFromPdf(
  fileOrBuffer: File | ArrayBuffer,
  password?: string
): Promise<ExtractedPdfResult> {
  let arrayBuffer: ArrayBuffer;
  let fileName = 'statement.pdf';
  let fileSizeBytes = 0;

  if (fileOrBuffer instanceof File) {
    fileName = fileOrBuffer.name;
    fileSizeBytes = fileOrBuffer.size;
    arrayBuffer = await fileOrBuffer.arrayBuffer();
  } else {
    arrayBuffer = fileOrBuffer;
    fileSizeBytes = arrayBuffer.byteLength;
  }

  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      password: password || undefined,
      cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
      cMapPacked: true,
    });

    const pdfDoc = await loadingTask.promise;
    const pageCount = pdfDoc.numPages;
    const textChunks: string[] = [];

    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Sort items by transform Y (top to bottom) and X (left to right) to preserve table structure
      const items = (textContent.items as any[]).filter((item) => item.str && item.str.trim().length > 0);

      // Group into lines based on Y coordinate (within 4px tolerance)
      const lines: { y: number; text: string }[] = [];
      let currentLineY: number | null = null;
      let currentLineParts: string[] = [];

      // Sort items from top of page to bottom, then left to right
      items.sort((a, b) => {
        const yA = a.transform[5];
        const yB = b.transform[5];
        const xA = a.transform[4];
        const xB = b.transform[4];
        if (Math.abs(yA - yB) > 4) {
          return yB - yA; // Higher Y coordinate is higher on the page
        }
        return xA - xB; // Left to right
      });

      for (const item of items) {
        const itemY = item.transform[5];
        if (currentLineY === null || Math.abs(currentLineY - itemY) > 4) {
          if (currentLineParts.length > 0) {
            lines.push({ y: currentLineY!, text: currentLineParts.join(' ') });
          }
          currentLineY = itemY;
          currentLineParts = [item.str.trim()];
        } else {
          currentLineParts.push(item.str.trim());
        }
      }

      if (currentLineParts.length > 0) {
        lines.push({ y: currentLineY!, text: currentLineParts.join(' ') });
      }

      const pageText = lines.map((l) => l.text).join('\n');
      textChunks.push(pageText);
    }

    return {
      text: textChunks.join('\n\n--- PAGE BREAK ---\n\n'),
      pageCount,
      fileName,
      fileSizeBytes,
    };
  } catch (err: any) {
    // Check if error is due to password protection
    const errorName = err?.name || '';
    const errorMsg = (err?.message || '').toLowerCase();
    const errorCode = err?.code;

    if (
      errorName === 'PasswordException' ||
      errorCode === 1 || // pdfjs NEED_PASSWORD
      errorCode === 2 || // pdfjs INCORRECT_PASSWORD
      errorMsg.includes('password')
    ) {
      const isIncorrect = errorCode === 2 || errorMsg.includes('incorrect');
      throw new PdfPasswordRequiredError(
        isIncorrect
          ? 'Incorrect statement password. Safaricom statements are protected with your Kenyan National ID or Passport Number.'
          : 'This Safaricom PDF statement is password-protected. Please enter your National ID or Passport number to unlock it.',
        isIncorrect
      );
    }

    throw new Error(`Failed to read PDF document: ${err?.message || 'Invalid or corrupted PDF file'}`);
  }
}

/**
 * Reads a text or CSV file
 */
export async function extractTextFromDocument(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read document file'));
    reader.readAsText(file);
  });
}
