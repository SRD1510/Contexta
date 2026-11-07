import { PromptTemplate } from "@/types";

export const BUILT_IN_PROMPTS: PromptTemplate[] = [
    {
        id: "research-1",
        title: "Deep Research",
        content: "Please research the following topic in depth, providing citations and distinguishing between factual claims and opinions. Structure your response with an executive summary, key findings, and detailed analysis:",
        category: "research",
        isBuiltIn: true,
        usageCount: 0,
        createdAt: new Date().toISOString(),
    },
    {
        id: "code-1",
        title: "Code Review",
        content: "Please review the following code for bugs, performance issues, and best practices. Suggest specific improvements with code examples:",
        category: "code",
        isBuiltIn: true,
        usageCount: 0,
        createdAt: new Date().toISOString(),
    },
    {
        id: "writing-1",
        title: "Blog Post",
        content: "Write an engaging blog post about the following topic. Use a conversational tone, include a catchy headline, and structure it with subheadings:",
        category: "writing",
        isBuiltIn: true,
        usageCount: 0,
        createdAt: new Date().toISOString(),
    },
    {
        id: "analysis-1",
        title: "SWOT Analysis",
        content: "Perform a SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) for:",
        category: "analysis",
        isBuiltIn: true,
        usageCount: 0,
        createdAt: new Date().toISOString(),
    },
    {
        id: "general-1",
        title: "Explain Like I'm 5",
        content: "Explain the following concept in simple terms that a 5-year-old could understand:",
        category: "general",
        isBuiltIn: true,
        usageCount: 0,
        createdAt: new Date().toISOString(),
    },
];
