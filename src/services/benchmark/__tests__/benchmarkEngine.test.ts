import { describe, it, expect } from "vitest";
import {
  scaleDocumentToTokens,
  chunkTextIntoBlocks,
  injectNeedleAtDepth,
  evaluateRecall,
} from "../needleEngine";
import {
  applyBaseline,
  applyDynamicBlockReordering,
  applySemanticPrioritization,
} from "../optimizationAlgorithms";
import {
  generateEvaluationReportMarkdown,
  DEFAULT_PROJECT_METADATA,
} from "../reportGenerator";

describe("Contexta Benchmark & Optimization Engine", () => {
  const sampleDoc = "The quick brown fox jumps over the lazy dog. ".repeat(20);
  const needleFact = "Confidential Token: 99482_ALPHA_XYZ";
  const query = "What is the confidential token?";

  describe("Needle Engine", () => {
    it("scales documents to target token boundaries", () => {
      const scaled = scaleDocumentToTokens(sampleDoc, 2000);
      expect(scaled.length).toBeGreaterThan(1000);
    });

    it("chunks text into discrete semantic blocks", () => {
      const blocks = chunkTextIntoBlocks(sampleDoc.repeat(10), 100);
      expect(blocks.length).toBeGreaterThan(2);
      expect(blocks[0].content.length).toBeGreaterThan(0);
    });

    it("injects needle precisely at 50% middle depth", () => {
      const blocks = chunkTextIntoBlocks(sampleDoc.repeat(10), 100);
      const { blocks: injected, needleBlockIndex, actualDepth } = injectNeedleAtDepth(
        blocks,
        needleFact,
        50
      );

      expect(injected[needleBlockIndex].hasNeedle).toBe(true);
      expect(injected[needleBlockIndex].content).toContain(needleFact);
      expect(actualDepth).toBeGreaterThanOrEqual(40);
      expect(actualDepth).toBeLessThanOrEqual(60);
    });

    it("evaluates recall accurately", () => {
      const perfectResponse = `The confidential token is 99482_ALPHA_XYZ as stated in the text.`;
      const eval1 = evaluateRecall(perfectResponse, "99482_ALPHA_XYZ", ["99482_ALPHA_XYZ", "token"]);
      expect(eval1.passed).toBe(true);
      expect(eval1.score).toBe(100);

      const failedResponse = `I could not locate any token in the document.`;
      const eval2 = evaluateRecall(failedResponse, "99482_ALPHA_XYZ", ["99482_ALPHA_XYZ"]);
      expect(eval2.passed).toBe(false);
      expect(eval2.score).toBe(0);
    });
  });

  describe("Context Optimization Algorithms", () => {
    it("Dynamic Block Reordering translocates middle blocks to boundary positions", () => {
      const blocks = chunkTextIntoBlocks(sampleDoc.repeat(10), 100);
      const { blocks: injected } = injectNeedleAtDepth(blocks, needleFact, 50);

      const baseline = applyBaseline(injected);
      expect(baseline.originalNeedleDepth).toBeGreaterThanOrEqual(40);

      const reordered = applyDynamicBlockReordering(injected);
      // Effective needle depth should now be near boundaries (primacy/recency)
      expect(reordered.strategy).toBe("dynamic_reordering");
      expect(reordered.effectiveNeedleDepth).not.toBe(50);
      expect(reordered.reorderedBlocks.some((b) => b.hasNeedle)).toBe(true);
    });

    it("Semantic Prioritization ranks query-relevant blocks at the top", () => {
      const blocks = chunkTextIntoBlocks(sampleDoc.repeat(10), 100);
      const { blocks: injected } = injectNeedleAtDepth(blocks, needleFact, 50);

      const prioritized = applySemanticPrioritization(injected, query);
      expect(prioritized.strategy).toBe("semantic_prioritization");
      // Top block should be the needle block
      expect(prioritized.reorderedBlocks[0].hasNeedle).toBe(true);
      expect(prioritized.effectiveNeedleDepth).toBe(0);
    });
  });

  describe("Academic Evaluation Report Generator", () => {
    it("generates formatted report with MLR Institute details", () => {
      const report = generateEvaluationReportMarkdown("dynamic_reordering");
      expect(report).toContain(DEFAULT_PROJECT_METADATA.projectTitle);
      expect(report).toContain("MLR Institute of Technology");
      expect(report).toContain("Mrs. B. Sushma");
      expect(report).toContain("23R21A12B0");
      expect(report).toContain("Dynamic Block Reordering");
    });
  });
});
