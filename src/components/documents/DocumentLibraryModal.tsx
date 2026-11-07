import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUIStore } from "@/stores";
import { DocumentUploader } from "./DocumentUploader";
import { DocumentList } from "./DocumentList";
import { FileText, Upload } from "lucide-react";

export function DocumentLibraryModal() {
  const { documentsOpen, closeDocuments } = useUIStore();

  return (
    <Dialog open={documentsOpen} onOpenChange={closeDocuments}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <span className="bg-primary/10 p-2 rounded-lg text-primary">
              <FileText className="h-5 w-5" />
            </span>
            Document Library
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden p-6 pt-2">
          <Tabs defaultValue="list" className="h-full flex flex-col">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 h-auto">
              <TabsTrigger 
                value="list"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
              >
                My Documents
              </TabsTrigger>
              <TabsTrigger 
                value="upload"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload New
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="flex-1 min-h-0 mt-4 h-full">
              <DocumentList />
            </TabsContent>

            <TabsContent value="upload" className="flex-1 mt-4">
              <div className="max-w-xl mx-auto mt-8">
                <DocumentUploader />
                
                <div className="mt-8 text-sm text-muted-foreground space-y-2">
                  <h4 className="font-medium text-foreground">Supported Formats</h4>
                  <ul className="list-disc list-inside space-y-1 ml-1">
                    <li>PDF Documents (.pdf) - Text extracted automatically</li>
                    <li>Text Files (.txt, .md, .markdown)</li>
                  </ul>
                  <p className="pt-2 text-xs">
                    * Large PDFs are processed locally in your browser using Web Workers. No file data is sent to any server.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
