import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, Loader2, FileType } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useDocumentStore } from '@/stores';
import { extractDocumentContent, validateFile } from '@/services/documentProcessor';
import { Document } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

export function DocumentUploader() {
  const { add, setUploading, setProgress, isUploading, uploadProgress } = useDocumentStore();
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    setProgress(0);
    
    let processedCount = 0;
    const totalFiles = acceptedFiles.length;

    try {
      for (const file of acceptedFiles) {
        // Validation
        const validation = validateFile(file);
        if (!validation.valid) {
          toast({
            title: "Skipped File",
            description: `${file.name}: ${validation.error}`,
            variant: "destructive"
          });
          processedCount++;
          continue;
        }

        // Processing
        try {
          const extracted = await extractDocumentContent(file);
          
          const newDoc: Document = {
            id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            type: file.name.split('.').pop()?.toLowerCase() as any,
            size: file.size,
            content: extracted.content,
            createdAt: new Date().toISOString(),
            pageCount: extracted.pageCount,
            wordCount: extracted.wordCount,
          };

          add(newDoc);
          
          toast({
            title: "Document Added",
            description: `Successfully processed ${file.name} (${extracted.wordCount} words)`,
          });

        } catch (error) {
          console.error("Extraction error:", error);
          toast({
            title: "Processing Failed",
            description: `Could not extract text from ${file.name}`,
            variant: "destructive"
          });
        }

        processedCount++;
        setProgress((processedCount / totalFiles) * 100);
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [add, setUploading, setProgress, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt', '.md', '.markdown']
    },
    disabled: isUploading,
    multiple: true
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 transition-all duration-200 ease-in-out text-center cursor-pointer
          ${isDragActive ? 'border-primary bg-primary/5 scale-[0.99]' : 'border-border hover:border-primary/50 hover:bg-muted/50'}
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-3">
          <div className="p-3 bg-muted rounded-full">
            <Upload className={`h-6 w-6 text-muted-foreground ${isDragActive ? 'text-primary animate-bounce' : ''}`} />
          </div>
          
          <div className="space-y-1">
            <h3 className="font-medium">
              {isDragActive ? "Drop files here" : "Upload Documents"}
            </h3>
            <p className="text-sm text-muted-foreground">
              Drag & drop or click to browse
            </p>
          </div>
          
          <div className="flex gap-2 text-xs text-muted-foreground/70">
            <span className="flex items-center gap-1"><FileType className="h-3 w-3" /> PDF</span>
            <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> TXT</span>
            <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> MD</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-2"
          >
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Processing documents...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
