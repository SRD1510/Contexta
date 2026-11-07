import { useState, useEffect, useRef } from "react";
import { AppState, Conversation, Message, Settings, SidebarState, UIPreferences } from "@/types";
import { storage } from "@/services/storage";
import { MODEL_CONFIGS } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

export function useAppState() {
  const [state, setState] = useState<AppState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  // Load state on mount
  useEffect(() => {
    let mounted = true;

    storage.loadState().then((loadedState) => {
      if (mounted) {
        setState(loadedState);
        setIsLoading(false);
        if (import.meta.env.DEV) {
          console.log("🔄 Initial state loaded");
        }
      }
    }).catch((error) => {
      if (mounted) {
        if (import.meta.env.DEV) {
          console.error("Failed to load state:", error);
        }
        // Use default state on error
        setState({
          conversations: {},
          settings: {
            apiKeys: { openai: "", anthropic: "", google: "", openrouter: "" },
            defaultModel: "gpt-4o",
            defaultTemperature: 0.7,
            defaultMaxTokens: 4096,
            autoSummarization: {
              enabled: true,
              threshold: 0.7,
              keepRecentCount: 10,
              style: "concise" as const,
            },
            researchMode: false,
          },
          active_conversation_id: null,
          uiPreferences: {
            sidebarState: "full",
            sidebarWidth: 300,
            focusMode: false,
          },
        });
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  // Save state with debouncing (don't save on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!state) return;

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce saves to avoid excessive writes
    saveTimeoutRef.current = setTimeout(async () => {
      const result = await storage.saveState(state);
      if (!result.success && result.error) {
        // Only show error toast for critical storage failures
        if (result.error.includes("quota") || result.error.includes("denied")) {
          toast({
            title: "Storage Error",
            description: result.error,
            variant: "destructive",
          });
        } else if (import.meta.env.DEV) {
          console.warn("Storage save warning:", result.error);
        }
      }
    }, 500); // 500ms debounce

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state, toast]);

  // Return default state structure if not loaded yet
  if (!state) {
    return {
      state: {
        conversations: {},
        settings: {
          apiKeys: { openai: "", anthropic: "", google: "", openrouter: "" },
          defaultModel: "gpt-4o",
          defaultTemperature: 0.7,
          defaultMaxTokens: 4096,
          autoSummarization: {
            enabled: true,
            threshold: 0.7,
            keepRecentCount: 10,
            style: "concise" as const,
          },
          researchMode: false,
        },
        active_conversation_id: null,
        uiPreferences: {
          sidebarState: "full",
          sidebarWidth: 300,
          focusMode: false,
        },
      },
      isLoading: true,
      activeConversation: null,
      createConversation: () => "",
      loadConversation: () => { },
      deleteConversation: () => { },
      addMessage: () => { },
      editMessage: () => { },
      replaceMessages: () => { },
      updateSettings: () => { },
      summarizeConversation: async () => { },
      startFreshWithSummary: () => { },
      renameConversation: () => { },
      updateUIPreferences: () => { },
      toggleSidebar: () => { },
      setSidebarWidth: () => { },
      toggleFocusMode: () => { },
    };
  }

  const activeConversation = state.active_conversation_id
    ? state.conversations[state.active_conversation_id]
    : null;

  const createConversation = () => {
    const id = `conv-${Date.now()}`;
    const modelId = state.settings.defaultModel;
    // Fallback to gpt-4o if configured model is invalid
    const config = MODEL_CONFIGS[modelId] || MODEL_CONFIGS["gpt-4o"];

    // Safety check if even default is missing (should not happen but good for TS)
    if (!config) {
      console.error(`Model ID ${modelId} not found and fallback failed`);
      return "";
    }

    const newConversation: Conversation = {
      id,
      title: "New Conversation",
      created_at: new Date().toISOString(),
      messages: [],
      total_tokens: 0,
      summary: null,
      metadata: {
        model: modelId,
        provider: config.provider,
        temperature: state.settings.defaultTemperature,
        maxTokens: state.settings.defaultMaxTokens,
        contextWindow: config.contextWindow,
      },
    };

    if (import.meta.env.DEV) {
      console.log("✨ Creating new conversation:", id);
    }

    setState((prev) => ({
      ...prev,
      conversations: {
        ...prev.conversations,
        [id]: newConversation,
      },
      active_conversation_id: id,
    }));

    return id;
  };

  const loadConversation = (id: string) => {
    if (import.meta.env.DEV) {
      console.log("📂 Loading conversation:", id);
    }
    setState((prev) => ({
      ...prev,
      active_conversation_id: id,
    }));
  };

  const deleteConversation = (id: string) => {
    if (import.meta.env.DEV) {
      console.log("🗑️ Deleting conversation:", id);
    }
    setState((prev) => {
      const conversations = { ...prev.conversations };
      delete conversations[id];
      return {
        ...prev,
        conversations,
        active_conversation_id:
          prev.active_conversation_id === id ? null : prev.active_conversation_id,
      };
    });
  };

  const renameConversation = (id: string, newTitle: string) => {
    if (import.meta.env.DEV) {
      console.log("✏️ Renaming conversation:", id, "to", newTitle);
    }
    setState((prev) => ({
      ...prev,
      conversations: {
        ...prev.conversations,
        [id]: {
          ...prev.conversations[id],
          title: newTitle,
        },
      },
    }));
  };

  const addMessage = (conversationId: string, message: Message) => {
    if (import.meta.env.DEV) {
      console.log("💬 Adding message to conversation:", conversationId);
    }
    setState((prev) => {
      const conversation = prev.conversations[conversationId];
      if (!conversation) return prev;

      const updatedConversation: Conversation = {
        ...conversation,
        messages: [...conversation.messages, message],
        total_tokens: conversation.total_tokens + (message.metadata?.tokens || 0),
      };

      // Auto-generate title from first user message
      if (
        updatedConversation.messages.length === 1 &&
        message.role === "user" &&
        updatedConversation.title === "New Conversation"
      ) {
        updatedConversation.title =
          message.content.substring(0, 50) + (message.content.length > 50 ? "..." : "");
      }

      return {
        ...prev,
        conversations: {
          ...prev.conversations,
          [conversationId]: updatedConversation,
        },
      };
    });
  };

  const editMessage = (conversationId: string, messageId: string, newContent: string) => {
    if (import.meta.env.DEV) {
      console.log("✏️ Editing message:", messageId, "in conversation:", conversationId);
    }
    setState((prev) => {
      const conversation = prev.conversations[conversationId];
      if (!conversation) return prev;

      const updatedMessages = conversation.messages.map((msg) =>
        msg.id === messageId ? { ...msg, content: newContent } : msg
      );

      return {
        ...prev,
        conversations: {
          ...prev.conversations,
          [conversationId]: {
            ...conversation,
            messages: updatedMessages,
          },
        },
      };
    });
  };

  const replaceMessages = (conversationId: string, messages: Message[], newTokenCount: number) => {
    if (import.meta.env.DEV) {
      console.log("🔄 Replacing messages in conversation:", conversationId);
    }
    setState((prev) => {
      const conversation = prev.conversations[conversationId];
      if (!conversation) return prev;

      return {
        ...prev,
        conversations: {
          ...prev.conversations,
          [conversationId]: {
            ...conversation,
            messages,
            total_tokens: newTokenCount,
          },
        },
      };
    });
  };

  const updateSettings = async (settings: Partial<Settings>) => {
    if (import.meta.env.DEV) {
      console.log("⚙️ Updating settings");
    }

    // If API keys are being updated, save them separately
    if (settings.apiKeys) {
      await storage.saveApiKeys(settings.apiKeys);
    }
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...settings,
      },
    }));
  };

  const summarizeConversation = async (conversationId: string, summary: string) => {
    if (import.meta.env.DEV) {
      console.log("📝 Summarizing conversation:", conversationId);
    }
    setState((prev) => {
      const conversation = prev.conversations[conversationId];
      if (!conversation) return prev;

      return {
        ...prev,
        conversations: {
          ...prev.conversations,
          [conversationId]: {
            ...conversation,
            summary,
          },
        },
      };
    });
  };

  const startFreshWithSummary = (conversationId: string) => {
    const conversation = state.conversations[conversationId];
    if (!conversation || !conversation.summary) return;

    if (import.meta.env.DEV) {
      console.log("🔄 Starting fresh with summary from:", conversationId);
    }

    const id = `conv-${Date.now()}`;
    const newConversation: Conversation = {
      ...conversation,
      id,
      title: `${conversation.title} (continued)`,
      created_at: new Date().toISOString(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: "system",
          content: `Previous conversation summary: ${conversation.summary}`,
          timestamp: new Date().toISOString(),
        },
      ],
      total_tokens: 0,
      summary: null,
    };

    setState((prev) => ({
      ...prev,
      conversations: {
        ...prev.conversations,
        [id]: newConversation,
      },
      active_conversation_id: id,
    }));
  };

  const forkConversation = (conversationId: string, fromMessageId: string) => {
    if (!state) return "";
    const original = state.conversations[conversationId];
    if (!original) return "";

    if (import.meta.env.DEV) {
      console.log("🌿 Forking conversation:", conversationId, "from message:", fromMessageId);
    }

    const messageIndex = original.messages.findIndex((m) => m.id === fromMessageId);
    if (messageIndex === -1) return "";

    const id = `conv-${Date.now()}`;
    // Use same model/config as original, fallback to default if not found
    const modelId = original.metadata.model;
    const config = MODEL_CONFIGS[modelId] || MODEL_CONFIGS["gpt-4o"];

    const newConversation: Conversation = {
      id,
      title: `${original.title} (branch)`,
      created_at: new Date().toISOString(),
      messages: original.messages.slice(0, messageIndex + 1),
      total_tokens: 0,
      summary: null,
      metadata: {
        model: modelId,
        provider: config.provider,
        temperature: original.metadata.temperature,
        maxTokens: original.metadata.maxTokens,
        contextWindow: config.contextWindow,
      },
      parentId: conversationId,
      forkFromMessageId: fromMessageId,
    };

    // Recalculate tokens for the sliced messages
    const initialTokens = newConversation.messages.reduce(
      (sum, msg) => sum + (msg.metadata?.tokens || 0), 0
    );
    newConversation.total_tokens = initialTokens;

    setState((prev) => ({
      ...prev,
      conversations: {
        ...prev.conversations,
        [id]: newConversation,
      },
      active_conversation_id: id,
    }));

    return id;
  };

  // UI Preferences Management
  const updateUIPreferences = (preferences: Partial<UIPreferences>) => {
    if (import.meta.env.DEV) {
      console.log("🎨 Updating UI preferences:", preferences);
    }
    setState((prev) => ({
      ...prev,
      uiPreferences: {
        ...prev.uiPreferences,
        ...preferences,
      },
    }));
  };

  const toggleSidebar = () => {
    if (import.meta.env.DEV) {
      console.log("🔀 Toggling sidebar");
    }
    setState((prev) => {
      const states: SidebarState[] = ["full", "collapsed"]; // Only 2 states now
      const currentIndex = states.indexOf(prev.uiPreferences.sidebarState);
      const nextIndex = (currentIndex + 1) % states.length;
      const nextState = states[nextIndex];
      if (import.meta.env.DEV) {
        console.log(`   ${prev.uiPreferences.sidebarState} → ${nextState}`);
      }
      return {
        ...prev,
        uiPreferences: {
          ...prev.uiPreferences,
          sidebarState: nextState,
        },
      };
    });
  }

  const setSidebarWidth = (width: number) => {
    if (import.meta.env.DEV) {
      console.log("📏 Setting sidebar width:", width);
    }
    setState((prev) => ({
      ...prev,
      uiPreferences: {
        ...prev.uiPreferences,
        sidebarWidth: Math.max(240, Math.min(400, width)),
      },
    }));
  };

  const toggleFocusMode = () => {
    if (import.meta.env.DEV) {
      console.log("🎯 Toggling focus mode");
    }
    setState((prev) => ({
      ...prev,
      uiPreferences: {
        ...prev.uiPreferences,
        focusMode: !prev.uiPreferences.focusMode,
      },
    }));
  };

  return {
    state,
    isLoading,
    activeConversation,
    createConversation,
    loadConversation,
    deleteConversation,
    addMessage,
    editMessage,
    replaceMessages,
    updateSettings,
    summarizeConversation,
    startFreshWithSummary,
    forkConversation,
    renameConversation,
    updateUIPreferences,
    toggleSidebar,
    setSidebarWidth,
    toggleFocusMode,
  };
}