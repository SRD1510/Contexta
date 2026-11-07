import { useDocumentStore, selectAllDocuments } from '@/stores';
import { Document, DocumentType } from '@/types';
import { FileText, Trash2, FileType, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useState, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';

export function DocumentList() {
  const documentsMap = useDocumentStore((state) => state.documents);
  const { remove } = useDocumentStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<DocumentType | 'all'>('all');

  // Memoize the sorted list to prevent re-renders
  const documents = useMemo(() => {
    return Object.values(documentsMap).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [documentsMap]);

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'all' || doc.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [documents, search, typeFilter]);

  const getIcon = (type: DocumentType) => {
    switch (type) {
      case 'pdf': return <FileType className="h-4 w-4 text-red-500" />;
      case 'md': return <FileText className="h-4 w-4 text-blue-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Filters */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search documents..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9"
          />
          {search && (
            <Button
              variant="ghost" 
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => setSearch('')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <select 
          className="h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
        >
          <option value="all">All</option>
          <option value="pdf">PDF</option>
          <option value="txt">TXT</option>
          <option value="md">MD</option>
        </select>
      </div>

      {/* List */}
      <ScrollArea className="flex-1 -mx-4 px-4">
        {filteredDocs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {search ? 'No matches found' : 'No documents uploaded yet'}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredDocs.map((doc) => (
              <div 
                key={doc.id}
                className="group flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-md bg-muted">
                    {getIcon(doc.type)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-medium truncate text-sm" title={doc.name}>
                      {doc.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatSize(doc.size)}</span>
                      <span>•</span>
                      <span>{doc.wordCount?.toLocaleString()} words</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Document?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will check "<strong>{doc.name}</strong>" and remove it from your library. 
                        This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => remove(doc.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
