import * as pdfjsLib from 'pdfjs-dist';
// Use Vite's worker import to bundle the worker correctly
import PdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?worker';

// Set worker port - this is the most reliable way in Vite
pdfjsLib.GlobalWorkerOptions.workerPort = new PdfWorker();

export interface ExtractedDocument {
    content: string;
    pageCount: number;
    wordCount: number;
}

/**
 * Extract text content from a PDF file
 */
export async function extractPdfText(file: File): Promise<ExtractedDocument> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const pageTexts: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
        pageTexts.push(pageText);
    }

    const content = pageTexts.join('\n\n');
    const wordCount = content.split(/\s+/).filter(Boolean).length;

    return {
        content,
        pageCount: pdf.numPages,
        wordCount,
    };
}

/**
 * Extract text from a plain text file
 */
export async function extractTextFile(file: File): Promise<ExtractedDocument> {
    const content = await file.text();
    const wordCount = content.split(/\s+/).filter(Boolean).length;

    return {
        content,
        pageCount: 1,
        wordCount,
    };
}

/**
 * Extract text from any supported file type
 */
export async function extractDocumentContent(file: File): Promise<ExtractedDocument> {
    const extension = file.name.split('.').pop()?.toLowerCase();

    switch (extension) {
        case 'pdf':
            return extractPdfText(file);
        case 'txt':
        case 'md':
            return extractTextFile(file);
        default:
            throw new Error(`Unsupported file type: ${extension}`);
    }
}

/**
 * Get document type from file extension
 */
export function getDocumentType(filename: string): 'pdf' | 'txt' | 'md' | null {
    const extension = filename.split('.').pop()?.toLowerCase();

    switch (extension) {
        case 'pdf':
            return 'pdf';
        case 'txt':
            return 'txt';
        case 'md':
        case 'markdown':
            return 'md';
        default:
            return null;
    }
}

/**
 * Validate file for upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const supportedTypes = ['pdf', 'txt', 'md', 'markdown'];

    const extension = file.name.split('.').pop()?.toLowerCase();

    if (!extension || !supportedTypes.includes(extension)) {
        return { valid: false, error: `Unsupported file type. Supported: ${supportedTypes.join(', ')}` };
    }

    if (file.size > maxSize) {
        return { valid: false, error: 'File size exceeds 10MB limit' };
    }

    return { valid: true };
}
