/**
 * Contexta Needle-in-a-Haystack Injection & Evaluation Engine
 * 
 * Injects predefined factual needles into document haystacks at target depths
 * and evaluates LLM recall performance against expected answers.
 */

export interface NeedleTestCase {
  id: string;
  name: string;
  domain: "legal" | "research" | "code" | "custom";
  documentText: string;
  needle: string;
  query: string;
  expectedAnswer: string;
  targetTokens: number;
  depthPercentage: number; // 0 to 100
}

export interface InjectedContextResult {
  fullContext: string;
  actualDepthPercentage: number;
  totalTokensApprox: number;
  needlePositionChar: number;
  blocks: ContextBlock[];
}

export interface ContextBlock {
  id: string;
  index: number;
  content: string;
  tokenCountApprox: number;
  hasNeedle: boolean;
  originalIndex: number;
  relevanceScore?: number;
}

export interface EvaluationResult {
  passed: boolean;
  score: number; // 0 to 100%
  extractedAnswer: string;
  matchedKeywords: string[];
  latencyMs: number;
  rawResponse: string;
}

/**
 * Fast rough token approximation (1 token ≈ 4 characters for English / code)
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

/**
 * Pads or tiles a base document to reach the target token count.
 */
export function scaleDocumentToTokens(baseText: string, targetTokens: number): string {
  const currentTokens = estimateTokens(baseText);
  if (currentTokens >= targetTokens) {
    // Truncate to approximately targetTokens
    return baseText.slice(0, targetTokens * 4);
  }

  // Tile the document repeatedly to fill the context
  const repeatCount = Math.ceil(targetTokens / currentTokens);
  let expanded = "";
  for (let i = 0; i < repeatCount; i++) {
    expanded += `\n\n[SECTION ${i + 1} - ARCHIVAL RECORD]\n` + baseText;
    if (estimateTokens(expanded) >= targetTokens) break;
  }
  return expanded.slice(0, targetTokens * 4);
}

/**
 * Chunks text into approx block sizes (e.g. 500-1000 tokens)
 */
export function chunkTextIntoBlocks(text: string, blockSizeTokens: number = 800): ContextBlock[] {
  const charBlockSize = blockSizeTokens * 4;
  const blocks: ContextBlock[] = [];
  let start = 0;
  let index = 0;

  while (start < text.length) {
    let end = start + charBlockSize;
    if (end < text.length) {
      // Find nearest paragraph or newline break
      const nextNewline = text.indexOf("\n\n", end - 100);
      if (nextNewline !== -1 && nextNewline < end + 200) {
        end = nextNewline + 2;
      }
    } else {
      end = text.length;
    }

    const content = text.slice(start, end).trim();
    if (content.length > 0) {
      blocks.push({
        id: `block-${index}`,
        index,
        originalIndex: index,
        content,
        tokenCountApprox: estimateTokens(content),
        hasNeedle: false,
      });
      index++;
    }
    start = end;
  }

  return blocks;
}

/**
 * Injects a needle into the blocks at a specified depth percentage (0 to 100).
 */
export function injectNeedleAtDepth(
  blocks: ContextBlock[],
  needle: string,
  depthPercentage: number
): { blocks: ContextBlock[]; needleBlockIndex: number; actualDepth: number } {
  if (blocks.length === 0) {
    return {
      blocks: [
        {
          id: "block-0",
          index: 0,
          originalIndex: 0,
          content: needle,
          tokenCountApprox: estimateTokens(needle),
          hasNeedle: true,
        },
      ],
      needleBlockIndex: 0,
      actualDepth: 50,
    };
  }

  const clampedDepth = Math.max(0, Math.min(100, depthPercentage));
  const targetIndex = Math.min(
    blocks.length - 1,
    Math.round((clampedDepth / 100) * (blocks.length - 1))
  );

  const updatedBlocks = blocks.map((b, idx) => {
    if (idx === targetIndex) {
      // Inject needle inside block
      const insertPoint = Math.floor(b.content.length / 2);
      const modifiedContent =
        b.content.slice(0, insertPoint) +
        `\n\n[CRITICAL RECORD NOTE: ${needle}]\n\n` +
        b.content.slice(insertPoint);

      return {
        ...b,
        content: modifiedContent,
        tokenCountApprox: estimateTokens(modifiedContent),
        hasNeedle: true,
      };
    }
    return { ...b, hasNeedle: false };
  });

  const actualDepth = (targetIndex / Math.max(1, blocks.length - 1)) * 100;

  return {
    blocks: updatedBlocks,
    needleBlockIndex: targetIndex,
    actualDepth: Math.round(actualDepth),
  };
}

/**
 * Evaluates whether model's response correctly answers the needle prompt.
 */
export function evaluateRecall(
  modelResponse: string,
  expectedAnswer: string,
  keywords: string[] = []
): EvaluationResult {
  const normalizedResponse = modelResponse.toLowerCase();
  const normalizedExpected = expectedAnswer.toLowerCase().trim();

  // 1. Direct substring check
  const exactMatch = normalizedResponse.includes(normalizedExpected);

  // 2. Keyword density match
  const matchedKeywords: string[] = [];
  keywords.forEach((kw) => {
    if (normalizedResponse.includes(kw.toLowerCase().trim())) {
      matchedKeywords.push(kw);
    }
  });

  let score = 0;
  if (exactMatch) {
    score = 100;
  } else if (keywords.length > 0) {
    score = Math.round((matchedKeywords.length / keywords.length) * 100);
  } else {
    // Fallback word overlap
    const words = normalizedExpected.split(/\s+/).filter((w) => w.length > 3);
    const matchedWords = words.filter((w) => normalizedResponse.includes(w));
    score = words.length > 0 ? Math.round((matchedWords.length / words.length) * 100) : 0;
  }

  return {
    passed: score >= 70,
    score,
    extractedAnswer: modelResponse.trim().slice(0, 300),
    matchedKeywords,
    latencyMs: 0,
    rawResponse: modelResponse,
  };
}
