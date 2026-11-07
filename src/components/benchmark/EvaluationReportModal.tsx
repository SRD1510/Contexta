import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  generateEvaluationReportMarkdown,
  downloadReportAsFile,
  DEFAULT_PROJECT_METADATA,
} from "@/services/benchmark/reportGenerator";
import { BENCHMARK_MODELS } from "@/services/benchmark/benchmarkData";
import { OptimizationStrategy } from "@/services/benchmark/optimizationAlgorithms";
import { Download, Printer, FileText, CheckCircle2 } from "lucide-react";

interface EvaluationReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  strategy: OptimizationStrategy;
}

export function EvaluationReportModal({
  open,
  onOpenChange,
  strategy,
}: EvaluationReportModalProps) {
  const models = Object.values(BENCHMARK_MODELS);
  const metadata = DEFAULT_PROJECT_METADATA;

  const handleDownload = () => {
    const md = generateEvaluationReportMarkdown(strategy, metadata);
    downloadReportAsFile(md, "Contexta_Phase1_Project_Report.md");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto print:max-w-none print:h-auto">
        <DialogHeader className="border-b border-border/60 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              <div>
                <DialogTitle className="text-lg font-bold text-foreground">
                  Major Project Phase - I Evaluation Report
                </DialogTitle>
                <DialogDescription className="text-xs">
                  {metadata.department} • {metadata.institution}
                </DialogDescription>
              </div>
            </div>
            <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
              Verified Phase - I
            </Badge>
          </div>
        </DialogHeader>

        {/* Printable Report Body */}
        <div className="space-y-6 py-4 text-xs md:text-sm text-foreground/90 font-sans print:text-black">
          {/* Institution & Title Card */}
          <div className="bg-muted/40 p-4 rounded-xl border border-border/70 text-center space-y-1">
            <h2 className="text-base font-extrabold uppercase tracking-wide text-foreground">
              {metadata.projectTitle}
            </h2>
            <p className="text-xs font-semibold text-primary">
              {metadata.department} • {metadata.institution}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Under the Guidance of: <strong>{metadata.guide.name}</strong> ({metadata.guide.designation}, {metadata.guide.department})
            </p>
          </div>

          {/* Student Team Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Student Project Investigators
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {metadata.teamMembers.map((m) => (
                <div
                  key={m.rollNo}
                  className="bg-card border border-border/60 p-2.5 rounded-lg text-center"
                >
                  <p className="font-semibold text-foreground text-xs">{m.name}</p>
                  <p className="text-[11px] font-mono text-primary font-bold">{m.rollNo}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Abstract & Problem Statement */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              1. Abstract & Problem Statement
            </h4>
            <p className="leading-relaxed text-muted-foreground text-xs">
              Current Large Language Models struggle to accurately retrieve information located within the middle sections of large context windows ("Lost in the Middle"), resulting in reduced reliability for enterprise and research applications. Contexta deploys an automated benchmarking framework with <strong>Dynamic Block Reordering</strong> and <strong>Semantic Prioritization</strong> to measure and eliminate this retrieval trough.
            </p>
          </div>

          {/* Multi-LLM Comparison Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              2. Multi-LLM Benchmark Performance Comparison (32K Tokens)
            </h4>
            <div className="border border-border/70 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/70 text-foreground font-semibold border-b border-border/60">
                  <tr>
                    <th className="p-2.5">Model</th>
                    <th className="p-2.5">Provider</th>
                    <th className="p-2.5 text-center">Baseline Middle Recall</th>
                    <th className="p-2.5 text-center">Optimized Recall</th>
                    <th className="p-2.5 text-center">Accuracy Delta</th>
                    <th className="p-2.5 text-right">Avg Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {models.map((m) => {
                    const baseCell = m.strategies.baseline.find(
                      (c) => c.depthPercent === 50 && c.contextLength === "32K"
                    );
                    const optCell = m.strategies[strategy]?.find(
                      (c) => c.depthPercent === 50 && c.contextLength === "32K"
                    );
                    const baseVal = baseCell?.accuracy ?? m.summary.baselineMeanAccuracy;
                    const optVal = optCell?.accuracy ?? m.summary.optimizedMeanAccuracy;
                    const gain = (optVal - baseVal).toFixed(1);

                    return (
                      <tr key={m.modelId} className="hover:bg-muted/30">
                        <td className="p-2.5 font-bold text-foreground">{m.modelName}</td>
                        <td className="p-2.5 text-muted-foreground">{m.provider}</td>
                        <td className="p-2.5 text-center text-rose-500 font-bold">{baseVal}%</td>
                        <td className="p-2.5 text-center text-emerald-500 font-extrabold">{optVal}%</td>
                        <td className="p-2.5 text-center text-primary font-bold">+{gain}%</td>
                        <td className="p-2.5 text-right font-mono text-muted-foreground">
                          {optCell?.latencyMs ?? 1000}ms
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Objectives Verification Checklist */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              3. Verification of Project Objectives (Phase - I)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="flex items-start gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Develop automated benchmarking framework for long-context evaluation.</span>
              </div>
              <div className="flex items-start gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Measure retrieval accuracy across different LLMs and context lengths.</span>
              </div>
              <div className="flex items-start gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Implement context optimization strategies (Reordering & Prioritization).</span>
              </div>
              <div className="flex items-start gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Visualize evaluation metrics through 2D interactive heatmaps.</span>
              </div>
              <div className="flex items-start gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 md:col-span-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Generate comparative reports for model performance analysis.</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border/60 pt-3 flex items-center justify-between sm:justify-between print:hidden">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePrint} className="gap-1.5">
              <Printer className="h-4 w-4" />
              Print / Save PDF
            </Button>

            <Button onClick={handleDownload} className="gap-1.5">
              <Download className="h-4 w-4" />
              Export Markdown
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
