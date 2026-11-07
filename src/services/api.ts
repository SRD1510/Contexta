import { Message, ModelConfig, Provider } from "@/types";

export const MODEL_CONFIGS: Record<string, ModelConfig> = {
  "gpt-4o": {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    contextWindow: 128000,
    maxOutputTokens: 4096,
    apiEndpoint: "https://api.openai.com/v1/chat/completions",
    requiresApiKey: true,
    inputPrice: 5.00,
    outputPrice: 15.00,
  },
  "gpt-4": {
    id: "gpt-4",
    name: "GPT-4",
    provider: "openai",
    contextWindow: 8192,
    maxOutputTokens: 4096,
    apiEndpoint: "https://api.openai.com/v1/chat/completions",
    requiresApiKey: true,
    inputPrice: 30.00,
    outputPrice: 60.00,
  },
  "gpt-4-turbo": {
    id: "gpt-4-turbo-preview",
    name: "GPT-4 Turbo",
    provider: "openai",
    contextWindow: 128000,
    maxOutputTokens: 4096,
    apiEndpoint: "https://api.openai.com/v1/chat/completions",
    requiresApiKey: true,
    inputPrice: 10.00,
    outputPrice: 30.00,
  },
  "gpt-3.5-turbo": {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    provider: "openai",
    contextWindow: 16385,
    maxOutputTokens: 4096,
    apiEndpoint: "https://api.openai.com/v1/chat/completions",
    requiresApiKey: true,
    inputPrice: 0.50,
    outputPrice: 1.50,
  },
  "claude-3-opus": {
    id: "claude-3-opus-20240229",
    name: "Claude 3 Opus",
    provider: "anthropic",
    contextWindow: 200000,
    maxOutputTokens: 4096,
    apiEndpoint: "https://api.anthropic.com/v1/messages",
    requiresApiKey: true,
    inputPrice: 15.00,
    outputPrice: 75.00,
  },
  "claude-3-sonnet": {
    id: "claude-3-sonnet-20240229",
    name: "Claude 3 Sonnet",
    provider: "anthropic",
    contextWindow: 200000,
    maxOutputTokens: 4096,
    apiEndpoint: "https://api.anthropic.com/v1/messages",
    requiresApiKey: true,
    inputPrice: 3.00,
    outputPrice: 15.00,
  },
  "claude-3.5-sonnet": {
    id: "claude-3-5-sonnet-20241022",
    name: "Claude 3.5 Sonnet",
    provider: "anthropic",
    contextWindow: 200000,
    maxOutputTokens: 8192,
    apiEndpoint: "https://api.anthropic.com/v1/messages",
    requiresApiKey: true,
    inputPrice: 3.00,
    outputPrice: 15.00,
  },
  "gemini-2.0-flash": {
    id: "gemini-2.0-flash-exp",
    name: "Gemini 2.0 Flash",
    provider: "google",
    contextWindow: 131072,
    maxOutputTokens: 8192,
    apiEndpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent",
    requiresApiKey: true,
    inputPrice: 0.00, // Currently free in preview
    outputPrice: 0.00,
  },
  "openai/gpt-oss-20b:free": {
    id: "openai/gpt-oss-20b",
    name: "GPT-OSS 20B",
    provider: "openai",
    contextWindow: 200000,
    maxOutputTokens: 8192,
    apiEndpoint: "https://openrouter.ai/api/v1/chat/completions",
    requiresApiKey: true,
    inputPrice: 0,
    outputPrice: 0,
  },
  "llama3": {
    id: "llama3",
    name: "Llama 3 (Local)",
    provider: "ollama",
    contextWindow: 8192,
    maxOutputTokens: 4096,
    apiEndpoint: "http://localhost:11434/v1/chat/completions",
    requiresApiKey: false,
    inputPrice: 0,
    outputPrice: 0,
  },
  "llama3.1": {
    id: "llama3.1:8b",
    name: "Llama 3.1 8B (Local)",
    provider: "ollama",
    contextWindow: 131072,
    maxOutputTokens: 8192,
    apiEndpoint: "http://localhost:11434/v1/chat/completions",
    requiresApiKey: false,
    inputPrice: 0,
    outputPrice: 0,
  },
  "deepseek-r1": {
    id: "deepseek-r1:8b",
    name: "DeepSeek R1 8B (Local)",
    provider: "ollama",
    contextWindow: 131072,
    maxOutputTokens: 8192,
    apiEndpoint: "http://localhost:11434/v1/chat/completions",
    requiresApiKey: false,
    inputPrice: 0,
    outputPrice: 0,
  },
  "qwen2.5-coder": {
    id: "qwen2.5-coder:7b",
    name: "Qwen 2.5 Coder 7B (Local)",
    provider: "ollama",
    contextWindow: 32768,
    maxOutputTokens: 4096,
    apiEndpoint: "http://localhost:11434/v1/chat/completions",
    requiresApiKey: false,
    inputPrice: 0,
    outputPrice: 0,
  },
  "mistral": {
    id: "mistral",
    name: "Mistral (Local)",
    provider: "ollama",
    contextWindow: 8192,
    maxOutputTokens: 4096,
    apiEndpoint: "http://localhost:11434/v1/chat/completions",
    requiresApiKey: false,
    inputPrice: 0,
    outputPrice: 0,
  },
  "research-debugger": {
    id: "research-debugger",
    name: "Research Debugger",
    provider: "mock",
    contextWindow: 128000,
    maxOutputTokens: 4096,
    apiEndpoint: "mock",
    requiresApiKey: false,
    inputPrice: 0,
    outputPrice: 0,
  },
  "mimo": {
    id: "xiaomi/mimo-v2-flash:free",
    name: "Mimo",
    provider: "openrouter",
    contextWindow: 256000,
    maxOutputTokens: 4096,
    apiEndpoint: "https://openrouter.ai/api/v1/chat/completions",
    requiresApiKey: true,
    inputPrice: 0,
    outputPrice: 0,
  },
};

interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface AnthropicMessage {
  role: "user" | "assistant";
  content: string;
}

interface GoogleMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

function formatForProvider(
  messages: Message[],
  provider: Provider
): OpenAIMessage[] | { system: string; messages: AnthropicMessage[] } | { systemInstruction?: string; contents: GoogleMessage[] } {
  switch (provider) {
    case "openai":
      return messages.map((msg) => ({
        role: msg.role as "system" | "user" | "assistant",
        content: msg.content,
      }));

    case "anthropic": {
      const systemMessage = messages.find((m) => m.role === "system");
      const nonSystemMessages = messages.filter((m) => m.role !== "system");
      return {
        system: systemMessage?.content || "You are a helpful assistant.",
        messages: nonSystemMessages.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
      };
    }

    case "google": {
      const systemMessages = messages.filter((m) => m.role === "system");
      const systemInstruction = systemMessages.length > 0
        ? systemMessages.map((m) => m.content).join("\n\n")
        : undefined;

      return {
        systemInstruction,
        contents: messages
          .filter((m) => m.role !== "system")
          .map((msg) => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }],
          })),
      };
    }

    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

const RESEARCH_SYSTEM_PROMPT = `
You are in Research Mode. Your goal is to provide rigorous, well-researched answers.
1. CITATIONS: You MUST cite your sources using bracketed numbers like [1], [2].
2. SOURCES: At the end of your response, strictly follow this format for sources:
   
   References:
   [1] Title of Source - URL (if available) or Publication
   [2] Title of Source - URL (if available) or Publication

3. VERIFICATION: Distinguish between factual claims (cite them) and analysis.
4. FORMAT: Use markdown for structure.
`;

export async function sendMessage(
  messages: Message[],
  modelId: string,
  apiKey: string,
  temperature: number = 0.7,
  maxTokens: number = 2000,
  researchMode: boolean = false
): Promise<{ content: string; tokensUsed?: number }> {
  const config = MODEL_CONFIGS[modelId];
  if (!config) {
    throw new Error(`Unknown model: ${modelId}`);
  }

  // Inject system prompt if in research mode
  const effectiveMessages = [...messages];
  if (researchMode) {
    // Check if there is already a system message
    const systemIndex = effectiveMessages.findIndex(m => m.role === "system");
    if (systemIndex >= 0) {
      effectiveMessages[systemIndex] = {
        ...effectiveMessages[systemIndex],
        content: effectiveMessages[systemIndex].content + "\n\n" + RESEARCH_SYSTEM_PROMPT
      };
    } else {
      // Add new system message at the start
      effectiveMessages.unshift({
        id: "system-research",
        role: "system",
        content: RESEARCH_SYSTEM_PROMPT,
        timestamp: new Date().toISOString()
      });
    }
  }

  if (config.requiresApiKey && !apiKey) {
    throw new Error(`API key required for ${config.provider}`);
  }

  try {
    switch (config.provider) {
      case "openai": {
        const formattedMessages = formatForProvider(messages, "openai") as OpenAIMessage[];
        const response = await fetch(config.apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: config.id,
            messages: formattedMessages,
            temperature,
            max_tokens: maxTokens,
          }),
        });

        if (!response.ok) {
          let errorMessage = "OpenAI API request failed";
          try {
            const error = await response.json();
            errorMessage = error.error?.message || error.message || errorMessage;

            // Handle specific error codes
            if (response.status === 401) {
              errorMessage = "Invalid API key. Please check your OpenAI API key in settings.";
            } else if (response.status === 429) {
              errorMessage = "Rate limit exceeded. Please try again later.";
            } else if (response.status === 500) {
              errorMessage = "OpenAI server error. Please try again later.";
            }
          } catch (e) {
            // If JSON parsing fails, use status text
            errorMessage = response.statusText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          throw new Error("Invalid response format from OpenAI API");
        }

        return {
          content: data.choices[0].message.content || "",
          tokensUsed: data.usage?.total_tokens,
        };
      }

      case "anthropic": {
        const formatted = formatForProvider(messages, "anthropic") as {
          system: string;
          messages: AnthropicMessage[];
        };
        const response = await fetch(config.apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: config.id,
            system: formatted.system,
            messages: formatted.messages,
            temperature,
            max_tokens: maxTokens,
          }),
        });

        if (!response.ok) {
          let errorMessage = "Anthropic API request failed";
          try {
            const error = await response.json();
            errorMessage = error.error?.message || error.message || errorMessage;

            // Handle specific error codes
            if (response.status === 401) {
              errorMessage = "Invalid API key. Please check your Anthropic API key in settings.";
            } else if (response.status === 429) {
              errorMessage = "Rate limit exceeded. Please try again later.";
            } else if (response.status === 500) {
              errorMessage = "Anthropic server error. Please try again later.";
            }
          } catch (e) {
            errorMessage = response.statusText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();

        if (!data.content || !data.content[0] || !data.content[0].text) {
          throw new Error("Invalid response format from Anthropic API");
        }

        return {
          content: data.content[0].text,
          tokensUsed: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
        };
      }

      case "google": {
        const formatted = formatForProvider(messages, "google") as {
          systemInstruction?: string;
          contents: GoogleMessage[];
        };
        const url = `${config.apiEndpoint}?key=${apiKey}`;

        const requestBody: any = {
          contents: formatted.contents,
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
          },
        };

        if (formatted.systemInstruction) {
          requestBody.systemInstruction = {
            parts: [{ text: formatted.systemInstruction }]
          };
        }

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          let errorMessage = "Google API request failed";
          let originalError = "";
          try {
            const error = await response.json();
            originalError = error.error?.message || error.message || "";

            // Handle specific error codes but include original message
            if (response.status === 401 || response.status === 403) {
              errorMessage = `Invalid API key: ${originalError || "Please check your Google API key in settings."}`;
            } else if (response.status === 429) {
              errorMessage = `Rate limit exceeded: ${originalError || "Please try again later or check your quota at console.cloud.google.com"}`;
            } else if (response.status === 500) {
              errorMessage = `Google server error: ${originalError || "Please try again later."}`;
            } else {
              errorMessage = originalError || `Google API error (${response.status})`;
            }
          } catch (e) {
            errorMessage = response.statusText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();

        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content?.parts?.[0]?.text) {
          throw new Error("Invalid response format from Google API");
        }

        return {
          content: data.candidates[0].content.parts[0].text,
          tokensUsed: data.usageMetadata?.totalTokenCount,
        };
      }

      case "ollama": {
        const formattedMessages = messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));

        let endpoint = config.apiEndpoint;
        // If apiKey seems to be a URL, use it as the base for the endpoint
        if (apiKey && (apiKey.startsWith("http://") || apiKey.startsWith("https://"))) {
          if (apiKey.includes("/v1/chat/completions")) {
            endpoint = apiKey;
          } else {
            const baseUrl = apiKey.endsWith("/") ? apiKey.slice(0, -1) : apiKey;
            endpoint = `${baseUrl}/v1/chat/completions`;
          }
        }

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Ollama doesn't typically require an API key but we can pass one if configured
            // ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}), 
          },
          body: JSON.stringify({
            model: config.id, // Use the ID directly (e.g., "llama3" or "mistral")
            messages: formattedMessages,
            temperature,
            // stream: false // We are not streaming yet
          }),
        });

        if (!response.ok) {
          let errorMessage = "Ollama API request failed";
          try {
            const error = await response.json();
            errorMessage = error.error || error.message || errorMessage;
          } catch (e) {
            errorMessage = response.statusText || String(e);
          }

          if (typeof errorMessage !== 'string') {
            errorMessage = JSON.stringify(errorMessage);
          }

          if (response.status === 0 || errorMessage.includes("Failed to fetch")) {
            errorMessage = "Connection failed. Please ensure Ollama is running and CORS is configured.";
          } else if (response.status === 404) {
            errorMessage = `Model '${config.id}' not found. Please run 'ollama pull ${config.id}' or check your setup.`;
          }

          throw new Error(errorMessage);
        }

        const data = await response.json();
        return {
          content: data.choices?.[0]?.message?.content || data.message?.content || "",
          tokensUsed: (data.prompt_eval_count || 0) + (data.eval_count || 0)
        };
      }

      case "openrouter": {
        const formattedMessages = formatForProvider(messages, "openai") as OpenAIMessage[];
        const response = await fetch(config.apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
            "HTTP-Referer": window.location.origin,
            "X-Title": "Contexta",
          },
          body: JSON.stringify({
            model: config.id,
            messages: formattedMessages,
            temperature,
            max_tokens: maxTokens,
          }),
        });

        if (!response.ok) {
          let errorMessage = "OpenRouter API request failed";
          try {
            const error = await response.json();
            const originalError = error.error?.message || error.message || "";
            if (response.status === 401 || response.status === 403) {
              errorMessage = `Invalid API key: ${originalError || "Please check your OpenRouter API key in settings."}`;
            } else if (response.status === 429) {
              errorMessage = `Rate limit exceeded: ${originalError || "Please try again later."}`;
            } else {
              errorMessage = originalError || `OpenRouter error (${response.status})`;
            }
          } catch (e) {
            errorMessage = response.statusText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        return {
          content: data.choices?.[0]?.message?.content || "",
          tokensUsed: data.usage?.total_tokens,
        };
      }

      case "mock": {
        // Return a response with citations if research mode is on
        const baseContent = researchMode
          ? "I have analyzed your request using my internal debugger. Here are the key findings [1]. Research mode is confirmed active [2]."
          : "This is a mock response from the Research Debugger. Citations are only generated in Research Mode.";

        const citationTail = researchMode
          ? "\n\nReferences:\n[1] Internal System Log - system://debug\n[2] Feature Verification Suite - https://contexta.dev/docs/research"
          : "";

        // Artificial delay for realism
        await new Promise(resolve => setTimeout(resolve, 800));

        return {
          content: baseContent + citationTail,
          tokensUsed: 42,
        };
      }

      default:
        throw new Error(`Unsupported provider: ${config.provider}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      // Check for network errors
      if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        throw new Error("Network error. Please check your internet connection and try again.");
      }
      throw error;
    }
    throw new Error("Unknown error occurred while sending message");
  }
}

export function estimateTokens(text: string): number {
  // Rough estimation: ~4 characters per token
  return Math.ceil(text.length / 4);
}
