import { useEffect } from 'react';
import { useUIStore, useConversationStore } from '@/stores';

export function useKeyboardShortcuts() {
    const {
        toggleSidebar,
        toggleFocusMode,
        openSearch,
        openSettings,
        openDocuments
    } = useUIStore();

    const { createConversation } = useConversationStore();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if input/textarea focused (except for specific global shortcuts)
            const target = e.target as HTMLElement;
            const isInput = target.matches('input, textarea, [contenteditable]');

            // Cmd+K: Search
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                openSearch();
                return;
            }

            // Cmd+/: Toggle Sidebar
            if ((e.metaKey || e.ctrlKey) && e.key === '/') {
                e.preventDefault();
                toggleSidebar();
                return;
            }

            // Cmd+.: Toggle Focus Mode
            if ((e.metaKey || e.ctrlKey) && e.key === '.') {
                e.preventDefault();
                toggleFocusMode();
                return;
            }

            // Cmd+,: Settings
            if ((e.metaKey || e.ctrlKey) && e.key === ',') {
                e.preventDefault();
                openSettings();
                return;
            }

            // Cmd+D: Documents
            // Note: Cmd+D is usually "Bookmark", so we prevent default
            if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
                e.preventDefault();
                openDocuments();
                return;
            }

            // Cmd+N: New Conversation
            if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
                e.preventDefault();
                // Assuming default model for now, could grab from settings
                createConversation('gpt-4o');
                return;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggleSidebar, toggleFocusMode, openSearch, openSettings, openDocuments, createConversation]);
}
