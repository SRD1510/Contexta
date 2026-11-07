import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { Conversation, Message, Provider } from '@/types';
import { MODEL_CONFIGS } from '@/services/api';

// ================================
// Types
// ================================

interface ConversationState {
    conversations: Record<string, Conversation>;
    activeId: string | null;
    isLoading: boolean;
}

interface ConversationActions {
    // CRUD
    create: (modelId?: string) => string;
    load: (id: string) => void;
    delete: (id: string) => void;
    rename: (id: string, title: string) => void;

    // Messages
    addMessage: (conversationId: string, message: Message) => void;
    updateMessage: (conversationId: string, messageId: string, content: string) => void;
    replaceMessages: (conversationId: string, messages: Message[], newTokenCount: number) => void;

    // Summarization
    setSummary: (conversationId: string, summary: string) => void;

    // Branching
    fork: (conversationId: string, fromMessageId: string) => string;

    // Bulk operations
    setConversations: (conversations: Record<string, Conversation>) => void;
    clear: () => void;
}

type ConversationStore = ConversationState & ConversationActions;

// ================================
// Default Values
// ================================

const DEFAULT_MODEL = 'gpt-4o';

const createNewConversation = (modelId: string = DEFAULT_MODEL): Conversation => {
    const config = MODEL_CONFIGS[modelId] || MODEL_CONFIGS[DEFAULT_MODEL];
    const id = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return {
        id,
        title: 'New Conversation',
        created_at: new Date().toISOString(),
        messages: [],
        total_tokens: 0,
        summary: null,
        metadata: {
            model: modelId,
            provider: config?.provider || 'openai',
            temperature: 0.7,
            maxTokens: 4096,
            contextWindow: config?.contextWindow || 128000,
        },
    };
};

// ================================
// Store
// ================================

export const useConversationStore = create<ConversationStore>()(
    devtools(
        persist(
            (set, get) => ({
                // State
                conversations: {},
                activeId: null,
                isLoading: false,

                // Create new conversation
                create: (modelId?: string) => {
                    const conversation = createNewConversation(modelId);

                    set((state) => ({
                        conversations: {
                            ...state.conversations,
                            [conversation.id]: conversation,
                        },
                        activeId: conversation.id,
                    }));

                    return conversation.id;
                },

                // Load/select conversation
                load: (id: string) => {
                    set({ activeId: id });
                },

                // Delete conversation
                delete: (id: string) => {
                    set((state) => {
                        const { [id]: deleted, ...remaining } = state.conversations;
                        return {
                            conversations: remaining,
                            activeId: state.activeId === id ? null : state.activeId,
                        };
                    });
                },

                // Rename conversation
                rename: (id: string, title: string) => {
                    set((state) => ({
                        conversations: {
                            ...state.conversations,
                            [id]: {
                                ...state.conversations[id],
                                title,
                            },
                        },
                    }));
                },

                // Add message to conversation
                addMessage: (conversationId: string, message: Message) => {
                    set((state) => {
                        const conversation = state.conversations[conversationId];
                        if (!conversation) return state;

                        const updatedConversation: Conversation = {
                            ...conversation,
                            messages: [...conversation.messages, message],
                            total_tokens: conversation.total_tokens + (message.metadata?.tokens || 0),
                        };

                        // Auto-generate title from first user message
                        if (
                            updatedConversation.messages.length === 1 &&
                            message.role === 'user' &&
                            updatedConversation.title === 'New Conversation'
                        ) {
                            updatedConversation.title =
                                message.content.substring(0, 50) + (message.content.length > 50 ? '...' : '');
                        }

                        return {
                            conversations: {
                                ...state.conversations,
                                [conversationId]: updatedConversation,
                            },
                        };
                    });
                },

                // Update existing message
                updateMessage: (conversationId: string, messageId: string, content: string) => {
                    set((state) => {
                        const conversation = state.conversations[conversationId];
                        if (!conversation) return state;

                        return {
                            conversations: {
                                ...state.conversations,
                                [conversationId]: {
                                    ...conversation,
                                    messages: conversation.messages.map((msg) =>
                                        msg.id === messageId ? { ...msg, content } : msg
                                    ),
                                },
                            },
                        };
                    });
                },

                // Replace all messages (for summarization)
                replaceMessages: (conversationId: string, messages: Message[], newTokenCount: number) => {
                    set((state) => {
                        const conversation = state.conversations[conversationId];
                        if (!conversation) return state;

                        return {
                            conversations: {
                                ...state.conversations,
                                [conversationId]: {
                                    ...conversation,
                                    messages,
                                    total_tokens: newTokenCount,
                                },
                            },
                        };
                    });
                },

                // Set summary
                setSummary: (conversationId: string, summary: string) => {
                    set((state) => {
                        const conversation = state.conversations[conversationId];
                        if (!conversation) return state;

                        return {
                            conversations: {
                                ...state.conversations,
                                [conversationId]: {
                                    ...conversation,
                                    summary,
                                },
                            },
                        };
                    });
                },

                // Fork conversation from a specific message
                fork: (conversationId: string, fromMessageId: string) => {
                    const state = get();
                    const original = state.conversations[conversationId];
                    if (!original) return '';

                    const messageIndex = original.messages.findIndex((m) => m.id === fromMessageId);
                    if (messageIndex === -1) return '';

                    const forkedConversation = createNewConversation(original.metadata.model);
                    forkedConversation.title = `${original.title} (branch)`;
                    forkedConversation.messages = original.messages.slice(0, messageIndex + 1);
                    forkedConversation.parentId = conversationId;
                    forkedConversation.forkFromMessageId = fromMessageId;

                    set((state) => ({
                        conversations: {
                            ...state.conversations,
                            [forkedConversation.id]: forkedConversation,
                        },
                        activeId: forkedConversation.id,
                    }));

                    return forkedConversation.id;
                },

                // Set all conversations (for migration/sync)
                setConversations: (conversations: Record<string, Conversation>) => {
                    set({ conversations });
                },

                // Clear all conversations
                clear: () => {
                    set({ conversations: {}, activeId: null });
                },
            }),
            {
                name: 'contexta-conversations',
                partialize: (state) => ({
                    conversations: state.conversations,
                    activeId: state.activeId,
                }),
            }
        ),
        { name: 'ConversationStore' }
    )
);

// ================================
// Selectors
// ================================

export const selectActiveConversation = (state: ConversationStore) =>
    state.activeId ? state.conversations[state.activeId] : null;

export const selectConversationList = (state: ConversationStore) =>
    Object.values(state.conversations).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

export const selectConversationById = (id: string) => (state: ConversationStore) =>
    state.conversations[id];
