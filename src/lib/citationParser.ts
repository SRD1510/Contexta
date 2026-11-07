import { Citation } from "@/types";

export function parseCitations(content: string): Citation[] {
    const citations: Citation[] = [];

    // 1. Find the "References:" section at the end
    const referencesRegex = /References:\s*([\s\S]*)/i;
    const match = content.match(referencesRegex);

    if (!match) return [];

    const referencesText = match[1];

    // 2. Parse individual lines: [1] Title - URL
    // Regex to match: [id] content
    const lineRegex = /\[(\d+)\]\s+(.+)/g;
    let lineMatch;

    while ((lineMatch = lineRegex.exec(referencesText)) !== null) {
        const id = lineMatch[1];
        const fullText = lineMatch[2];

        // Try to extract URL if present (simple check for http sequence)
        const urlMatch = fullText.match(/(https?:\/\/[^\s]+)/);
        const url = urlMatch ? urlMatch[0] : undefined;

        // Clean text by removing URL if it's at the end
        let text = fullText;
        if (url) {
            text = text.replace(url, '').trim();
            // Remove trailing hyphens or commas
            text = text.replace(/[-–—]\s*$/, '').trim();
        }

        citations.push({
            id,
            source: text,
            url,
            text: fullText, // The full reference line
            verificationStatus: 'unverified'
        });
    }

    return citations;
}

/**
 * Removes the References section from the content for cleaner display
 * if desired (optional - currently we might want to keep it or hide it)
 */
export function stripCitationsSection(content: string): string {
    return content.replace(/References:\s*[\s\S]*/i, '').trim();
}
