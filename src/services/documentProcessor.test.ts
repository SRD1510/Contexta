import { describe, it, expect, vi } from 'vitest';
import { extractDocumentContent, validateFile } from './documentProcessor';

// Mock pdfjs-dist worker import
vi.mock('pdfjs-dist/build/pdf.worker.min.mjs?worker', () => ({
    default: class MockWorker { }
}));

// Mock pdfjs-dist main library
vi.mock('pdfjs-dist', () => {
    return {
        GlobalWorkerOptions: {
            workerSrc: '',
            workerPort: null,
        },
        getDocument: vi.fn(() => ({
            promise: Promise.resolve({
                numPages: 2,
                getPage: vi.fn(() => Promise.resolve({
                    getTextContent: vi.fn(() => Promise.resolve({
                        items: [{ str: 'Test content page' }]
                    }))
                }))
            })
        }))
    };
});

describe('documentProcessor', () => {
    describe('validateFile', () => {
        it('should validate correct file types', () => {
            const pdf = new File([''], 'test.pdf', { type: 'application/pdf' });
            expect(validateFile(pdf).valid).toBe(true);

            const txt = new File([''], 'test.txt', { type: 'text/plain' });
            expect(validateFile(txt).valid).toBe(true);
        });

        it('should reject unsupported types', () => {
            const jpg = new File([''], 'test.jpg', { type: 'image/jpeg' });
            const result = validateFile(jpg);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('Unsupported file type');
        });

        it('should reject files that are too large', () => {
            // Create a mock large file since we can't easily create a real 11MB file in memory efficiently
            const largeFile = {
                name: 'large.pdf',
                size: 11 * 1024 * 1024,
                type: 'application/pdf'
            } as File;

            const result = validateFile(largeFile);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('size exceeds 10MB');
        });
    });

    describe('extractDocumentContent', () => {
        it('should extract text from PDF', async () => {
            const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });

            // Mock arrayBuffer for JSDOM
            file.arrayBuffer = async () => new ArrayBuffer(0);

            const result = await extractDocumentContent(file);

            expect(result.pageCount).toBe(2);
            expect(result.content).toContain('Test content page');
        });

        it('should extract text from TXT', async () => {
            const content = 'Hello world text content';
            const file = new File([content], 'test.txt', { type: 'text/plain' });

            // Mock text method for JSDOM
            file.text = async () => content;

            const result = await extractDocumentContent(file);

            expect(result.content).toBe(content);
            expect(result.pageCount).toBe(1);
            expect(result.wordCount).toBe(4);
        });

        it('should throw error for unsupported extension', async () => {
            const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
            await expect(extractDocumentContent(file)).rejects.toThrow('Unsupported file type');
        });
    });
});
