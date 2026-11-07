import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Info } from "lucide-react";

export function OllamaGuide() {
  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Ollama Setup Required</AlertTitle>
        <AlertDescription>
          To use local models, you must configure Ollama to accept requests from this browser app.
        </AlertDescription>
      </Alert>

      <div className="space-y-2 text-sm">
        <p>1. <strong>Install Ollama</strong> from <a href="https://ollama.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ollama.com</a></p>
        <p>2. <strong>Pull a model</strong> (e.g., `ollama pull llama3`)</p>
        <p>3. <strong>Configure CORS</strong> (Important!):</p>
        <div className="bg-muted p-3 rounded-md font-mono text-xs overflow-x-auto relative group">
          <Terminal className="h-3 w-3 absolute top-3 right-3 text-muted-foreground" />
          <p className="text-muted-foreground mb-1"># For macOS:</p>
          <p>launchctl setenv OLLAMA_ORIGINS "*"</p>
          <p className="text-muted-foreground mt-2 mb-1"># Then restart Ollama:</p>
          <p>killall Ollama && open /Applications/Ollama.app</p>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Note: This command allows any website to access your local Ollama. For security, you can set `OLLAMA_ORIGINS` to `http://localhost:8080` (or your current port).
        </p>
      </div>
    </div>
  );
}
