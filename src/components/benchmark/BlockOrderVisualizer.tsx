import { motion } from "framer-motion";
import { OptimizationStrategy } from "@/services/benchmark/optimizationAlgorithms";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Layers, Sparkles, AlertCircle } from "lucide-react";

interface BlockOrderVisualizerProps {
  strategy: OptimizationStrategy;
}

export function BlockOrderVisualizer({ strategy }: BlockOrderVisualizerProps) {
  // Simplified 8-block representation for visualization
  const getBlocks = () => {
    switch (strategy) {
      case "dynamic_reordering":
        return [
          { id: "B0", label: "Block 0 (Intro)", isNeedle: false, zone: "Primacy (High Attention)" },
          { id: "B4", label: "Block 4 [NEEDLE]", isNeedle: true, zone: "Primacy Shift (Translocated)" },
          { id: "B1", label: "Block 1 (Context)", isNeedle: false, zone: "Context Body" },
          { id: "B2", label: "Block 2 (Context)", isNeedle: false, zone: "Context Body" },
          { id: "B5", label: "Block 5 (Context)", isNeedle: false, zone: "Context Body" },
          { id: "B6", label: "Block 6 (Context)", isNeedle: false, zone: "Context Body" },
          { id: "B3", label: "Block 3 (Context)", isNeedle: false, zone: "Recency Shift" },
          { id: "B7", label: "Block 7 (Query)", isNeedle: false, zone: "Recency (High Attention)" },
        ];
      case "semantic_prioritization":
        return [
          { id: "B4", label: "Block 4 [NEEDLE]", isNeedle: true, zone: "Rank #1 (Score: 95)" },
          { id: "B0", label: "Block 0 (Intro)", isNeedle: false, zone: "Rank #2 (Score: 60)" },
          { id: "B7", label: "Block 7 (Query)", isNeedle: false, zone: "Rank #3 (Score: 50)" },
          { id: "B1", label: "Block 1 (Context)", isNeedle: false, zone: "Rank #4 (Score: 20)" },
          { id: "B2", label: "Block 2 (Context)", isNeedle: false, zone: "Rank #5 (Score: 15)" },
          { id: "B3", label: "Block 3 (Context)", isNeedle: false, zone: "Rank #6 (Score: 10)" },
          { id: "B5", label: "Block 5 (Context)", isNeedle: false, zone: "Rank #7 (Score: 10)" },
          { id: "B6", label: "Block 6 (Context)", isNeedle: false, zone: "Rank #8 (Score: 5)" },
        ];
      case "baseline":
      default:
        return [
          { id: "B0", label: "Block 0 (Intro)", isNeedle: false, zone: "Primacy (High Attention)" },
          { id: "B1", label: "Block 1", isNeedle: false, zone: "Body" },
          { id: "B2", label: "Block 2", isNeedle: false, zone: "Body" },
          { id: "B3", label: "Block 3", isNeedle: false, zone: "Attention Decay Zone" },
          { id: "B4", label: "Block 4 [NEEDLE]", isNeedle: true, zone: "Attention Trough (Lost in Middle)" },
          { id: "B5", label: "Block 5", isNeedle: false, zone: "Attention Decay Zone" },
          { id: "B6", label: "Block 6", isNeedle: false, zone: "Body" },
          { id: "B7", label: "Block 7 (Query)", isNeedle: false, zone: "Recency (High Attention)" },
        ];
    }
  };

  const blocks = getBlocks();

  return (
    <div className="bg-card border border-border/70 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold text-foreground">
            Context Memory Layout & Attention Zone Mapping
          </h4>
        </div>

        <Badge variant="outline" className="text-xs font-mono capitalize">
          {strategy.replace("_", " ")}
        </Badge>
      </div>

      {/* Attention Zone Banner */}
      <div className="grid grid-cols-3 gap-2 text-center text-[11px] mb-3 font-medium">
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 py-1 rounded">
          Primacy Zone (Top 20%) ↑ High Attention
        </div>
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 py-1 rounded flex items-center justify-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Middle Zone (40-60%) ↓ Attention Deadzone
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 py-1 rounded">
          Recency Zone (Bottom 20%) ↑ High Attention
        </div>
      </div>

      {/* Blocks sequence */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
        {blocks.map((b, idx) => (
          <motion.div
            key={b.id}
            layout
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: idx * 0.03 }}
            className={`p-2.5 rounded-lg border flex flex-col justify-between min-h-[85px] text-left transition-all ${
              b.isNeedle
                ? strategy === "baseline"
                  ? "bg-rose-500/15 border-rose-500/50 ring-1 ring-rose-500/40"
                  : "bg-emerald-500/15 border-emerald-500/60 ring-1 ring-emerald-500/50"
                : "bg-muted/50 border-border/60 hover:bg-muted/80"
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-muted-foreground">
                  pos #{idx}
                </span>
                {b.isNeedle && (
                  <Sparkles
                    className={`h-3 w-3 ${
                      strategy === "baseline" ? "text-rose-500" : "text-emerald-500"
                    }`}
                  />
                )}
              </div>
              <p
                className={`text-xs font-bold truncate mt-1 ${
                  b.isNeedle
                    ? strategy === "baseline"
                      ? "text-rose-600 dark:text-rose-400 font-extrabold"
                      : "text-emerald-600 dark:text-emerald-400 font-extrabold"
                    : "text-foreground"
                }`}
              >
                {b.label}
              </p>
            </div>

            <span className="text-[9px] text-muted-foreground line-clamp-1 mt-1">
              {b.zone}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
        <ArrowRight className="h-3.5 w-3.5 text-primary flex-shrink-0" />
        <span>
          {strategy === "baseline"
            ? "In Baseline mode, Block 4 containing the needle is caught in Position #4 (the 50% attention trough), causing typical retrieval failure."
            : strategy === "dynamic_reordering"
            ? "With Dynamic Reordering, Block 4 is rotated into Position #1 (Primacy Zone), right after the introduction, maximizing attention recall."
            : "With Semantic Prioritization, Block 4 is ranked #1 based on query relevance keywords and injected at the very top of context memory."}
        </span>
      </div>
    </div>
  );
}
