import { useState } from "react";
import { motion } from "framer-motion";
import { HeatmapCell, CONTEXT_LENGTHS, NEEDLE_DEPTHS } from "@/services/benchmark/benchmarkData";
import { OptimizationStrategy } from "@/services/benchmark/optimizationAlgorithms";
import { Badge } from "@/components/ui/badge";

interface NeedleHeatmapProps {
  cells: HeatmapCell[];
  strategy: OptimizationStrategy;
  modelName: string;
}

export function NeedleHeatmap({ cells, strategy, modelName }: NeedleHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);

  // Group cells by depth (rows) and context length (columns)
  const getCell = (depth: number, lengthLabel: string): HeatmapCell | undefined => {
    return cells.find(
      (c) => c.depthPercent === depth && c.contextLength === lengthLabel
    );
  };

  const getCellBg = (accuracy: number) => {
    if (accuracy >= 85) return "bg-emerald-500 hover:bg-emerald-400 text-white";
    if (accuracy >= 70) return "bg-emerald-600/90 hover:bg-emerald-500 text-white";
    if (accuracy >= 55) return "bg-amber-500 hover:bg-amber-400 text-white";
    if (accuracy >= 40) return "bg-orange-500 hover:bg-orange-400 text-white";
    return "bg-rose-600 hover:bg-rose-500 text-white";
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span>2D Context Retrieval Heatmap:</span>
            <span className="text-primary font-bold">{modelName}</span>
          </h3>
          <p className="text-xs text-muted-foreground">
            {strategy === "baseline"
              ? "Notice the severe degradation (red dip) in the 50% middle depth zone ('Lost in the Middle')."
              : strategy === "dynamic_reordering"
              ? "Dynamic Reordering translocates middle blocks to boundary positions, recovering recall accuracy."
              : "Semantic Prioritization anchors highest-relevance needle blocks to top attention zones."}
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Recall:</span>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-rose-600 inline-block" />
            <span className="text-[11px] text-muted-foreground">&lt;40%</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-amber-500 inline-block" />
            <span className="text-[11px] text-muted-foreground">50-70%</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
            <span className="text-[11px] text-muted-foreground">85-100%</span>
          </div>
        </div>
      </div>

      {/* 2D Grid */}
      <div className="bg-card border border-border/70 rounded-xl p-4 shadow-sm overflow-x-auto">
        <div className="min-w-[500px]">
          {/* Header Row: Context Lengths */}
          <div className="grid grid-cols-6 gap-2 mb-2 items-center text-center">
            <div className="text-xs font-semibold text-muted-foreground text-left pl-1">
              Needle Depth ↓
            </div>
            {CONTEXT_LENGTHS.map((len) => (
              <div
                key={len.label}
                className="text-xs font-bold text-foreground bg-muted/60 py-1.5 rounded-md border border-border/40"
              >
                {len.label}
                <span className="block text-[10px] font-normal text-muted-foreground">
                  ~{len.tokens.toLocaleString()} tokens
                </span>
              </div>
            ))}
          </div>

          {/* Rows by Depth */}
          {NEEDLE_DEPTHS.map((depth) => (
            <div key={depth} className="grid grid-cols-6 gap-2 mb-2 items-center">
              {/* Row Label */}
              <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 pl-1">
                <span>{depth}%</span>
                {depth === 50 && (
                  <Badge
                    variant="outline"
                    className="text-[9px] px-1 py-0 h-4 border-rose-400 text-rose-500 font-bold"
                  >
                    Middle
                  </Badge>
                )}
              </div>

              {/* Grid Cells */}
              {CONTEXT_LENGTHS.map((len) => {
                const cell = getCell(depth, len.label);
                const accuracy = cell?.accuracy ?? 50;
                const isMiddle = depth === 50;

                return (
                  <motion.div
                    key={`${len.label}-${depth}`}
                    layout
                    initial={{ scale: 0.95, opacity: 0.8 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.25 }}
                    onMouseEnter={() => cell && setHoveredCell(cell)}
                    onMouseLeave={() => setHoveredCell(null)}
                    className={`h-12 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-200 border ${
                      isMiddle && strategy === "baseline"
                        ? "border-rose-400 ring-1 ring-rose-400/40"
                        : "border-black/10"
                    } ${getCellBg(accuracy)}`}
                  >
                    <span className="text-sm font-extrabold tracking-tight">
                      {accuracy}%
                    </span>
                    <span className="text-[10px] opacity-80 font-medium">
                      {cell?.latencyMs ? `${cell.latencyMs}ms` : ""}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Hovered Cell Detail Strip */}
        <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground min-h-[28px]">
          {hoveredCell ? (
            <div className="flex items-center gap-4">
              <span className="font-semibold text-foreground">
                Inspecting: {hoveredCell.contextLength} tokens @ {hoveredCell.depthPercent}% depth
              </span>
              <span>
                Recall Accuracy:{" "}
                <strong className={hoveredCell.accuracy >= 75 ? "text-emerald-500" : "text-rose-500"}>
                  {hoveredCell.accuracy}%
                </strong>
              </span>
              <span>
                Simulated Latency: <strong>{hoveredCell.latencyMs}ms</strong>
              </span>
              <span className="capitalize">
                Status:{" "}
                <strong
                  className={
                    hoveredCell.status === "passed"
                      ? "text-emerald-500"
                      : hoveredCell.status === "degraded"
                      ? "text-amber-500"
                      : "text-rose-500"
                  }
                >
                  {hoveredCell.status}
                </strong>
              </span>
            </div>
          ) : (
            <span>Hover over any coordinate cell to view detailed retrieval metrics.</span>
          )}
        </div>
      </div>
    </div>
  );
}
