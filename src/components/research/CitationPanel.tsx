import { Citation } from "@/types";
import { CheckCircle, XCircle, HelpCircle, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface CitationPanelProps {
  citations: Citation[];
  className?: string;
}

export function CitationPanel({ citations, className }: CitationPanelProps) {
  if (!citations || citations.length === 0) return null;

  return (
    <div className={cn("w-full border-t bg-muted/30 p-4", className)}>
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        Sources
        <Badge variant="secondary" className="text-xs">
          {citations.length}
        </Badge>
      </h3>
      <ScrollArea className="max-h-[200px]">
        <div className="space-y-3 pr-4">
          {citations.map((cite) => (
            <div
              key={cite.id}
              className="group p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  [{cite.id}]
                </span>
                <VerificationBadge status={cite.verificationStatus} />
              </div>
              
              <p className="text-sm text-foreground/90 mb-2 line-clamp-3">
                "{cite.text}"
              </p>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-medium truncate max-w-[200px]">
                  {cite.source}
                </span>
                {cite.url && (
                  <a
                    href={cite.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    Visit <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function VerificationBadge({ status }: { status: Citation["verificationStatus"] }) {
  switch (status) {
    case "verified":
      return (
        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200 gap-1">
          <CheckCircle className="h-3 w-3" /> Verified
        </Badge>
      );
    case "refuted":
      return (
        <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200 gap-1">
          <XCircle className="h-3 w-3" /> Refuted
        </Badge>
      );
    case "neutral":
      return (
        <Badge variant="outline" className="bg-gray-500/10 text-gray-600 border-gray-200 gap-1">
          <HelpCircle className="h-3 w-3" /> Neutral
        </Badge>
      );
    default:
      return null;
  }
}
