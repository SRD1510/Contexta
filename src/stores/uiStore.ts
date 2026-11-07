import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { SidebarState, UIPreferences } from '@/types';

// ================================
// Types
// ================================

interface UIState {
    // Sidebar
    sidebarState: SidebarState;
    sidebarWidth: number;

    // Focus mode
    focusMode: boolean;

    // Modals
    settingsOpen: boolean;
    searchOpen: boolean;
    shortcutsOpen: boolean;
    documentsOpen: boolean;

    // Loading states
    isSummarizing: boolean;
    isSending: boolean;
}

interface UIActions {
    // Sidebar
    toggleSidebar: () => void;
    setSidebarState: (state: SidebarState) => void;
    setSidebarWidth: (width: number) => void;

    // Focus mode
    toggleFocusMode: () => void;
    setFocusMode: (enabled: boolean) => void;

    // Modals
    openSettings: () => void;
    closeSettings: () => void;
    toggleSettings: () => void;
    openSearch: () => void;
    closeSearch: () => void;
    toggleSearch: () => void;
    openShortcuts: () => void;
    closeShortcuts: () => void;

    openDocuments: () => void;
    closeDocuments: () => void;
    toggleDocuments: () => void;

    closeAllModals: () => void;

    // Loading states
    setIsSummarizing: (value: boolean) => void;
    setIsSending: (value: boolean) => void;
}

type UIStore = UIState & UIActions;

// ================================
// Default Values
// ================================

const DEFAULT_UI_STATE: UIState = {
    sidebarState: 'full',
    sidebarWidth: 300,
    focusMode: false,
    settingsOpen: false,
    searchOpen: false,
    shortcutsOpen: false,
    documentsOpen: false,
    isSummarizing: false,
    isSending: false,
};

// ================================
// Store
// ================================

export const useUIStore = create<UIStore>()(
    devtools(
        persist(
            (set) => ({
                // State
                ...DEFAULT_UI_STATE,

                // Sidebar actions
                toggleSidebar: () => {
                    set((state) => {
                        const states: SidebarState[] = ['full', 'collapsed'];
                        const currentIndex = states.indexOf(state.sidebarState);
                        const nextIndex = (currentIndex + 1) % states.length;
                        return { sidebarState: states[nextIndex] };
                    });
                },

                setSidebarState: (sidebarState: SidebarState) => {
                    set({ sidebarState });
                },

                setSidebarWidth: (width: number) => {
                    set({ sidebarWidth: Math.max(240, Math.min(400, width)) });
                },

                // Focus mode actions
                toggleFocusMode: () => {
                    set((state) => ({ focusMode: !state.focusMode }));
                },

                setFocusMode: (focusMode: boolean) => {
                    set({ focusMode });
                },

                // Modal actions
                openSettings: () => set({ settingsOpen: true }),
                closeSettings: () => set({ settingsOpen: false }),
                toggleSettings: () => set((state) => ({ settingsOpen: !state.settingsOpen })),

                openSearch: () => set({ searchOpen: true }),
                closeSearch: () => set({ searchOpen: false }),
                toggleSearch: () => set((state) => ({ searchOpen: !state.searchOpen })),

                openShortcuts: () => set({ shortcutsOpen: true }),
                closeShortcuts: () => set({ shortcutsOpen: false }),

                openDocuments: () => set({ documentsOpen: true }),
                closeDocuments: () => set({ documentsOpen: false }),
                toggleDocuments: () => set((state) => ({ documentsOpen: !state.documentsOpen })),

                closeAllModals: () => set({
                    settingsOpen: false,
                    searchOpen: false,
                    shortcutsOpen: false,
                    documentsOpen: false,
                }),

                // Loading state actions
                setIsSummarizing: (isSummarizing: boolean) => set({ isSummarizing }),
                setIsSending: (isSending: boolean) => set({ isSending }),
            }),
            {
                name: 'contexta-ui',
                partialize: (state) => ({
                    sidebarState: state.sidebarState,
                    sidebarWidth: state.sidebarWidth,
                    focusMode: state.focusMode,
                }),
            }
        ),
        { name: 'UIStore' }
    )
);

// ================================
// Selectors
// ================================

export const selectSidebarState = (state: UIStore) => state.sidebarState;
export const selectIsCollapsed = (state: UIStore) => state.sidebarState === 'collapsed';
export const selectFocusMode = (state: UIStore) => state.focusMode;
export const selectIsLoading = (state: UIStore) => state.isSending || state.isSummarizing;
