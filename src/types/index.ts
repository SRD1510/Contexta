// ================================
// Core Types for Contexta
// ================================

export type MessageRole = "user" | "assistant" | "system";
export type Provider = "openai" | "anthropic" | "google" | "mock" | "ollama" | "openrouter";
export type SidebarState = "full" | "collapsed" | "hidden";
export type SummaryStyle = "structured" | "concise" | "research" | "narrative";

// ================================
// Message Types
// ================================

export interface MessageMetadata {
  model: string;
  provider: Provider;
  temperature: number;
  tokens?: number;
  type?: "auto_summary" | "manual_summary" | "regular";
  originalMessageCount?: number;
  messageIds?: string[];
  createdAt?: string;
  summaryStyle?: string;
  cost?: number; // Cost in USD
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  citations?: Citation[];
  metadata?: MessageMetadata;
}

// ================================
// Conversation Types
// ================================

export type VerificationStatus = "verified" | "neutral" | "refuted" | "unverified";

export interface Citation {
  id: string;
  source: string;
  url?: string;
  text: string;
  verificationStatus: VerificationStatus;
}

export interface ConversationMetadata {
  model: string;
  provider: Provider;
  temperature: number;
  maxTokens: number;
  contextWindow: number;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  messages: Message[];
  total_tokens: number;
  summary: string | null;
  metadata: ConversationMetadata;
  // Branching support
  parentId?: string;
  forkFromMessageId?: string;
}

// ================================
// Settings Types
// ================================

export interface AutoSummarization {
  enabled: boolean;
  threshold: number;
  keepRecentCount: number;
  style: SummaryStyle;
}

export interface Settings {
  apiKeys: {
    openai: string;
    anthropic: string;
    google: string;
    openrouter?: string;
    ollama?: string; // Base URL, optional, defaults to http://localhost:11434
  };
  defaultModel: string;
  defaultTemperature: number;
  defaultMaxTokens: number;
  autoSummarization: AutoSummarization;
  researchMode?: boolean;
}

// ================================
// UI Types
// ================================

export interface UIPreferences {
  sidebarState: SidebarState;
  sidebarWidth: number;
  focusMode: boolean;
}

// ================================
// App State (Legacy - for migration)
// ================================

export interface AppState {
  conversations: Record<string, Conversation>;
  settings: Settings;
  active_conversation_id: string | null;
  uiPreferences: UIPreferences;
}

// ================================
// Model Configuration
// ================================

export interface ModelConfig {
  id: string;
  name: string;
  provider: Provider;
  contextWindow: number;
  maxOutputTokens: number;
  apiEndpoint: string;
  requiresApiKey: boolean;
  inputPrice?: number;  // Per 1M tokens
  outputPrice?: number; // Per 1M tokens
}

// ================================
// Document Types (Phase 1)
// ================================

export type DocumentType = 'pdf' | 'txt' | 'md';

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  size: number;
  content: string;       // Extracted text content
  createdAt: string;
  // Optional metadata
  pageCount?: number;    // For PDFs
  wordCount?: number;
}

// ================================
// Search Types (Phase 1)
// ================================

export type SearchResultType = 'conversation' | 'document' | 'message';

export interface SearchResult {
  type: SearchResultType;
  id: string;
  parentId?: string;     // For messages, the conversation ID
  title: string;
  snippet: string;
  matchCount: number;
  createdAt: string;
}

// ================================
// Prompt Template Types (Phase 1)
// ================================

export type PromptCategory = 'research' | 'writing' | 'code' | 'analysis' | 'general';

export interface PromptTemplate {
  id: string;
  title: string;
  content: string;
  category: PromptCategory;
  isBuiltIn: boolean;
  usageCount: number;
  createdAt: string;
}