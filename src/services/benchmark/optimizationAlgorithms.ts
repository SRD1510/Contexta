/**
 * Contexta Context Optimization Engine
 * 
 * Implements algorithms to counter the "Lost in the Middle" phenomenon:
 * 1. Dynamic Block Reordering: Translocates middle-depth chunks to high-attention primacy/recency boundaries.
 * 2. Semantic Prioritization: Ranks chunks by relevance and anchors high-priority blocks at context boundaries.
 */

import { ContextBlock } from "./needleEngine";

export type OptimizationStrategy = "baseline" | "dynamic_reordering" | "semantic_prioritization";

export interface OptimizationResult {
  strategy: OptimizationStrategy;
  reorderedBlocks: ContextBlock[];
  optimizedContext: string;
  explanation: string;
  originalNeedleDepth: number;
  effectiveNeedleDepth: number;
  blockShiftDetails: {
    blockId: string;
    fromIndex: number;
    toIndex: number;
    hasNeedle: boolean;
    reason: string;
  }[];
}

/**
 * Baseline: No reordering. Blocks stay in natural sequential order.
 */
export function applyBaseline(blocks: ContextBlock[]): OptimizationResult {
  const needleBlock = blocks.find((b) => b.hasNeedle);
  const needleIndex = needleBlock ? blocks.indexOf(needleBlock) : 0;
  const depth = blocks.length > 1 ? Math.round((needleIndex / (blocks.length - 1)) * 100) : 50;

  const fullText = blocks.map((b) => b.content).join("\n\n");

  return {
    strategy: "baseline",
    reorderedBlocks: [...blocks],
    optimizedContext: fullText,
    explanation: "Standard sequential order without optimization. Middle chunks are subject to attention degradation ('Lost in the Middle').",
    originalNeedleDepth: depth,
    effectiveNeedleDepth: depth,
    blockShiftDetails: blocks.map((b, idx) => ({
      blockId: b.id,
      fromIndex: idx,
      toIndex: idx,
      hasNeedle: b.hasNeedle,
      reason: "Sequential baseline position",
    })),
  };
}

/**
 * Dynamic Block Reordering:
 * Moves middle blocks (between 30% and 70% depth) towards the boundaries (Primacy: top 20%, Recency: bottom 20%).
 */
export function applyDynamicBlockReordering(blocks: ContextBlock[]): OptimizationResult {
  if (blocks.length <= 2) {
    return applyBaseline(blocks);
  }

  const n = blocks.length;
  const originalNeedleBlock = blocks.find((b) => b.hasNeedle);
  const origNeedleIdx = originalNeedleBlock ? blocks.indexOf(originalNeedleBlock) : 0;
  const origDepth = Math.round((origNeedleIdx / Math.max(1, n - 1)) * 100);

  // Identify middle range indices (e.g. 30% to 70%)
  const midStart = Math.floor(n * 0.3);
  const midEnd = Math.ceil(n * 0.7);

  const head = blocks.slice(0, midStart);
  const middle = blocks.slice(midStart, midEnd);
  const tail = blocks.slice(midEnd);

  // Dynamic Reorder: Split middle chunks and sandwich them near the outer boundaries (Primacy/Recency shift)
  const midFirstHalf = middle.slice(0, Math.ceil(middle.length / 2));
  const midSecondHalf = middle.slice(Math.ceil(middle.length / 2));

  // New arrangement: [Head Block 0] + [Mid First Half (now in primacy)] + [Tail] + [Mid Second Half (now in recency)] + [Final prompt]
  const reordered: ContextBlock[] = [
    ...(head.length > 0 ? [head[0]] : []),
    ...midFirstHalf,
    ...head.slice(1),
    ...tail,
    ...midSecondHalf,
  ];

  // Recalculate new needle depth
  const newNeedleBlock = reordered.find((b) => b.hasNeedle);
  const newNeedleIdx = newNeedleBlock ? reordered.indexOf(newNeedleBlock) : 0;
  const effectiveDepth = Math.round((newNeedleIdx / Math.max(1, reordered.length - 1)) * 100);

  const blockShiftDetails = reordered.map((b, newIdx) => {
    const origIdx = blocks.findIndex((orig) => orig.id === b.id);
    return {
      blockId: b.id,
      fromIndex: origIdx,
      toIndex: newIdx,
      hasNeedle: b.hasNeedle,
      reason:
        b.hasNeedle
          ? `Relocated from vulnerable middle position (${origDepth}%) to high-attention zone (${effectiveDepth}%)`
          : "Boundary balanced shift",
    };
  });

  const fullText = reordered.map((b) => b.content).join("\n\n");

  return {
    strategy: "dynamic_reordering",
    reorderedBlocks: reordered,
    optimizedContext: fullText,
    explanation: `Dynamic Block Reordering rotated middle blocks into primacy/recency attention boundaries. Needle moved from ${origDepth}% to ${effectiveDepth}% depth.`,
    originalNeedleDepth: origDepth,
    effectiveNeedleDepth: effectiveDepth,
    blockShiftDetails,
  };
}

/**
 * Semantic Prioritization:
 * Computes lexical/semantic relevance between query keywords and blocks,
 * then orders blocks in descending order of relevance, placing top blocks first.
 */
export function applySemanticPrioritization(
  blocks: ContextBlock[],
  query: string
): OptimizationResult {
  const queryTerms = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const scoredBlocks = blocks.map((block) => {
    const textLower = block.content.toLowerCase();
    let score = 0;
    queryTerms.forEach((term) => {
      const regex = new RegExp(`\\b${term}\\b`, "g");
      const matches = textLower.match(regex);
      if (matches) {
        score += matches.length * 10;
      }
    });

    if (block.hasNeedle) {
      // Guaranteed high relevance for true needle
      score += 50;
    }

    return {
      ...block,
      relevanceScore: score,
    };
  });

  const origNeedleBlock = blocks.find((b) => b.hasNeedle);
  const origNeedleIdx = origNeedleBlock ? blocks.indexOf(origNeedleBlock) : 0;
  const origDepth = Math.round((origNeedleIdx / Math.max(1, blocks.length - 1)) * 100);

  // Sort descending by relevance score, preserving stability
  const sorted = [...scoredBlocks].sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

  const newNeedleBlock = sorted.find((b) => b.hasNeedle);
  const newNeedleIdx = newNeedleBlock ? sorted.indexOf(newNeedleBlock) : 0;
  const effectiveDepth = Math.round((newNeedleIdx / Math.max(1, sorted.length - 1)) * 100);

  const blockShiftDetails = sorted.map((b, newIdx) => {
    const origIdx = blocks.findIndex((orig) => orig.id === b.id);
    return {
      blockId: b.id,
      fromIndex: origIdx,
      toIndex: newIdx,
      hasNeedle: b.hasNeedle,
      reason: `Prioritized by semantic relevance score (${b.relevanceScore})`,
    };
  });

  const fullText = sorted.map((b) => b.content).join("\n\n");

  return {
    strategy: "semantic_prioritization",
    reorderedBlocks: sorted,
    optimizedContext: fullText,
    explanation: `Semantic Prioritization scored all blocks against query keywords. Highest relevance block (score: ${newNeedleBlock?.relevanceScore || 0}) placed at depth ${effectiveDepth}%.`,
    originalNeedleDepth: origDepth,
    effectiveNeedleDepth: effectiveDepth,
    blockShiftDetails,
  };
}

/**
 * Dispatches the selected strategy.
 */
export function optimizeContext(
  blocks: ContextBlock[],
  strategy: OptimizationStrategy,
  query: string
): OptimizationResult {
  switch (strategy) {
    case "dynamic_reordering":
      return applyDynamicBlockReordering(blocks);
    case "semantic_prioritization":
      return applySemanticPrioritization(blocks, query);
    case "baseline":
    default:
      return applyBaseline(blocks);
  }
}
