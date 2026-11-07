import { useState } from "react";
import {
  BENCHMARK_MODELS,
  DOMAIN_PRESETS,
} from "@/services/benchmark/benchmarkData";
import { OptimizationStrategy } from "@/services/benchmark/optimizationAlgorithms";
import { NeedleHeatmap } from "./NeedleHeatmap";
import { BlockOrderVisualizer } from "./BlockOrderVisualizer";
import { LiveProbeModal } from "./LiveProbeModal";
import { EvaluationReportModal } from "./EvaluationReportModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles,
  Play,
  FileBarChart2,
  TrendingUp,
  AlertTriangle,
  Zap,
  BookOpen,
  Scale,
  Code2,
  Cpu,
} from "lucide-react";

export function BenchmarkLab() {
  const [selectedModelId, setSelectedModelId] = useState<string>("gpt-4o");
  const [strategy, setStrategy] = useState<OptimizationStrategy>("dynamic_reordering");
  const [selectedDomain, setSelectedDomain] = useState<"legal" | "research" | "code">("legal");

  const [liveProbeOpen, setLiveProbeOpen] = useState<boolean>(false);
  const [reportOpen, setReportOpen] = useState<boolean>(false);

  const modelSuite = BENCHMARK_MODELS[selectedModelId] || BENCHMARK_MODELS["gpt-4o"];
  const domainPreset = DOMAIN_PRESETS[selectedDomain];
  const activeCells = modelSuite.strategies[strategy];

  // Compute stats
  const middleCell = activeCells.find((c) => c.depthPercent === 50 && c.contextLength === "32K");
  const baselineMiddleCell = modelSuite.strategies.baseline.find(
    (c) => c.depthPercent === 50 && c.contextLength === "32K"
  );
  const currentMiddleRecall = middleCell?.accuracy ?? 70;
  const baselineMiddleRecall = baselineMiddleCell?.accuracy ?? 40;
  const deltaGain = currentMiddleRecall - baselineMiddleRecall;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Banner & Control Bar */}
      <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="bg-primary/10 text-primary font-mono text-[11px] gap-1">
                <Cpu className="h-3 w-3" />
                AI Infrastructure & Evaluation Engine
              </Badge>
              <Badge variant="outline" className="text-[11px] font-mono">
                Phase - I Deliverable
              </Badge>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
              Contexta - Context Optimization & Benchmarking Suite
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Empirical evaluation and algorithmic mitigation of the <strong>"Lost in the Middle"</strong> phenomenon across extended context windows.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReportOpen(true)}
              className="gap-1.5 shadow-sm"
            >
              <FileBarChart2 className="h-4 w-4 text-primary" />
              Evaluation Report
            </Button>

            <Button
              size="sm"
              onClick={() => setLiveProbeOpen(true)}
              className="gap-1.5 shadow-sm bg-primary hover:bg-primary/90"
            >
              <Play className="h-4 w-4 fill-current" />
              Run Live Probe
            </Button>
          </div>
        </div>

        {/* Global Controls: Model Selector & Strategy Switcher */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-border/60 items-center">
          {/* Model Selector */}
          <div className="md:col-span-4 flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
              Evaluation Model:
            </span>
            <Select value={selectedModelId} onValueChange={setSelectedModelId}>
              <SelectTrigger className="h-9 text-xs font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(BENCHMARK_MODELS).map((m) => (
                  <SelectItem key={m.modelId} value={m.modelId} className="text-xs font-medium">
                    {m.modelName} ({m.provider})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Strategy Toggle */}
          <div className="md:col-span-8 flex items-center justify-start md:justify-end gap-2 overflow-x-auto">
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
              Strategy:
            </span>
            <div className="inline-flex rounded-lg border border-border/70 p-0.5 bg-muted/40">
              <button
                type="button"
                onClick={() => setStrategy("baseline")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  strategy === "baseline"
                    ? "bg-card text-foreground shadow-sm border border-border/50"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                1. Baseline (Raw Context)
              </button>
              <button
                type="button"
                onClick={() => setStrategy("dynamic_reordering")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  strategy === "dynamic_reordering"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sparkles className="h-3 w-3" />
                2. Dynamic Reordering
              </button>
              <button
                type="button"
                onClick={() => setStrategy("semantic_prioritization")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  strategy === "semantic_prioritization"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Zap className="h-3 w-3" />
                3. Semantic Prioritization
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border border-border/70 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Middle (50%) Recall</span>
            <AlertTriangle className={`h-4 w-4 ${strategy === "baseline" ? "text-rose-500" : "text-emerald-500"}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black ${strategy === "baseline" ? "text-rose-500" : "text-emerald-500"}`}>
              {currentMiddleRecall}%
            </span>
            {strategy !== "baseline" && (
              <span className="text-xs text-muted-foreground line-through">
                {baselineMiddleRecall}%
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {strategy === "baseline" ? "Severe attention trough" : "Restored via optimization"}
          </p>
        </div>

        <div className="bg-card border border-border/70 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Optimization Delta</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-500">
              {strategy === "baseline" ? "0.0%" : `+${deltaGain.toFixed(1)}%`}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Gain over standard prompt
          </p>
        </div>

        <div className="bg-card border border-border/70 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Attention Decay Penalty</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-foreground">
              -{modelSuite.summary.middleDepthDrop}%
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Unoptimized drop in middle
          </p>
        </div>

        <div className="bg-card border border-border/70 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Max Tested Context</span>
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-foreground">
              128K
            </span>
            <span className="text-xs text-muted-foreground">Tokens</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Scalable synthetic dilation
          </p>
        </div>
      </div>

      {/* Main Visualization Grid: 2D Heatmap */}
      <NeedleHeatmap
        cells={activeCells}
        strategy={strategy}
        modelName={modelSuite.modelName}
      />

      {/* Memory Order Visualizer */}
      <BlockOrderVisualizer strategy={strategy} />

      {/* Domain Preset Inspector */}
      <div className="bg-card border border-border/70 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">
              Domain Ingestion Preset: {domainPreset.name}
            </h4>
          </div>

          <Tabs
            value={selectedDomain}
            onValueChange={(val) => setSelectedDomain(val as "legal" | "research" | "code")}
          >
            <TabsList className="h-8">
              <TabsTrigger value="legal" className="text-xs gap-1">
                <Scale className="h-3 w-3" /> Legal (MSA)
              </TabsTrigger>
              <TabsTrigger value="research" className="text-xs gap-1">
                <BookOpen className="h-3 w-3" /> Research Paper
              </TabsTrigger>
              <TabsTrigger value="code" className="text-xs gap-1">
                <Code2 className="h-3 w-3" /> Code Repository
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-muted/40 p-3 rounded-lg border border-border/60 space-y-1">
            <span className="text-muted-foreground font-semibold block text-[11px] uppercase tracking-wider">
              Document Archive
            </span>
            <p className="font-bold text-foreground truncate">{domainPreset.haystackTitle}</p>
            <p className="text-muted-foreground text-[11px] line-clamp-2">{domainPreset.description}</p>
          </div>

          <div className="bg-muted/40 p-3 rounded-lg border border-border/60 space-y-1">
            <span className="text-muted-foreground font-semibold block text-[11px] uppercase tracking-wider">
              Injected Needle Fact
            </span>
            <p className="font-mono text-foreground line-clamp-3 text-[11px] bg-card p-1.5 rounded border border-border/50">
              {domainPreset.needle}
            </p>
          </div>

          <div className="bg-muted/40 p-3 rounded-lg border border-border/60 space-y-1">
            <span className="text-muted-foreground font-semibold block text-[11px] uppercase tracking-wider">
              Verification Query & Expected Answer
            </span>
            <p className="font-medium text-foreground text-[11px]">Q: {domainPreset.query}</p>
            <p className="font-bold text-emerald-500 text-[11px] mt-1">A: {domainPreset.expectedAnswer}</p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <LiveProbeModal
        open={liveProbeOpen}
        onOpenChange={setLiveProbeOpen}
        defaultStrategy={strategy}
      />

      <EvaluationReportModal
        open={reportOpen}
        onOpenChange={setReportOpen}
        strategy={strategy}
      />
    </div>
  );
}
