import { Message, ModelConfig } from "@/types";
import { MODEL_CONFIGS } from "./api";
import { estimateTokens } from "./api";

interface CostResult {
    inputTokens: number;
    outputTokens: number;
    inputCost: number;
    outputCost: number;
    totalCost: number;
}

export function calculateMessageCost(
    modelId: string,
    inputContent: string,
    outputContent: string
): CostResult {
    const config = MODEL_CONFIGS[modelId];
    if (!config) {
        return { inputTokens: 0, outputTokens: 0, inputCost: 0, outputCost: 0, totalCost: 0 };
    }

    const inputTokens = estimateTokens(inputContent);
    const outputTokens = estimateTokens(outputContent);

    const inputPricePerMillion = config.inputPrice || 0;
    const outputPricePerMillion = config.outputPrice || 0;

    const inputCost = (inputTokens / 1_000_000) * inputPricePerMillion;
    const outputCost = (outputTokens / 1_000_000) * outputPricePerMillion;

    return {
        inputTokens,
        outputTokens,
        inputCost,
        outputCost,
        totalCost: inputCost + outputCost,
    };
}

export function calculateConversationCost(messages: Message[]): number {
    return messages.reduce((total, msg) => {
        return total + (msg.metadata?.cost || 0);
    }, 0);
}

export function formatCost(cost: number): string {
    if (cost === 0) return "$0.00";
    if (cost < 0.01) return "<$0.01";
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
    }).format(cost);
}
