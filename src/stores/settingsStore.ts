import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { Settings, AutoSummarization } from '@/types';

// ================================
// Types
// ================================

interface SettingsState {
    settings: Settings;
    isLoading: boolean;
}

interface SettingsActions {
    updateSettings: (settings: Partial<Settings>) => void;
    updateApiKey: (provider: 'openai' | 'anthropic' | 'google', key: string) => void;
    updateAutoSummarization: (config: Partial<AutoSummarization>) => void;
    setResearchMode: (enabled: boolean) => void;
    reset: () => void;
}

type SettingsStore = SettingsState & SettingsActions;

// ================================
// Default Values
// ================================

const DEFAULT_SETTINGS: Settings = {
    apiKeys: {
        openai: '',
        anthropic: '',
        google: '',
    },
    defaultModel: 'gpt-4o',
    defaultTemperature: 0.7,
    defaultMaxTokens: 4096,
    autoSummarization: {
        enabled: true,
        threshold: 0.7,
        keepRecentCount: 10,
        style: 'concise',
    },
    researchMode: false,
};

// ================================
// Store
// ================================

export const useSettingsStore = create<SettingsStore>()(
    devtools(
        persist(
            (set) => ({
                // State
                settings: DEFAULT_SETTINGS,
                isLoading: false,

                // Update partial settings
                updateSettings: (newSettings: Partial<Settings>) => {
                    set((state) => ({
                        settings: {
                            ...state.settings,
                            ...newSettings,
                        },
                    }));
                },

                // Update single API key
                updateApiKey: (provider: 'openai' | 'anthropic' | 'google', key: string) => {
                    set((state) => ({
                        settings: {
                            ...state.settings,
                            apiKeys: {
                                ...state.settings.apiKeys,
                                [provider]: key,
                            },
                        },
                    }));
                },

                // Update auto-summarization config
                updateAutoSummarization: (config: Partial<AutoSummarization>) => {
                    set((state) => ({
                        settings: {
                            ...state.settings,
                            autoSummarization: {
                                ...state.settings.autoSummarization,
                                ...config,
                            },
                        },
                    }));
                },

                // Toggle research mode
                setResearchMode: (enabled: boolean) => {
                    set((state) => ({
                        settings: {
                            ...state.settings,
                            researchMode: enabled,
                        },
                    }));
                },

                // Reset to defaults
                reset: () => {
                    set({ settings: DEFAULT_SETTINGS });
                },
            }),
            {
                name: 'contexta-settings',
                // Don't persist API keys in plain localStorage - we'll handle encryption separately
                partialize: (state) => ({
                    settings: {
                        ...state.settings,
                        // Exclude API keys from persistence (handled by security module)
                        apiKeys: { openai: '', anthropic: '', google: '' },
                    },
                }),
            }
        ),
        { name: 'SettingsStore' }
    )
);

// ================================
// Selectors
// ================================

export const selectApiKey = (provider: 'openai' | 'anthropic' | 'google') =>
    (state: SettingsStore) => state.settings.apiKeys[provider];

export const selectDefaultModel = (state: SettingsStore) =>
    state.settings.defaultModel;

export const selectAutoSummarization = (state: SettingsStore) =>
    state.settings.autoSummarization;

export const selectResearchMode = (state: SettingsStore) =>
    state.settings.researchMode;
