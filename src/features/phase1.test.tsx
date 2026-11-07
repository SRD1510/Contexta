import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchModal } from '@/components/modals/SearchModal';
import { InputBox } from '@/components/InputBox';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { renderHook } from '@testing-library/react';
import React from 'react';

// Mock stores
const mockConversations = {
  'c1': { id: 'c1', title: 'React Testing', messages: [], created_at: new Date().toISOString() },
  'c2': { id: 'c2', title: 'Python Scripts', messages: [], created_at: new Date().toISOString() }
};

// Mock ResizeObserver for cmdk
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock PointerEvent for Radix UI
class MockPointerEvent extends Event {
  button: number;
  ctrlKey: boolean;
  pointerType: string;

  constructor(type: string, props: PointerEventInit) {
    super(type, props);
    this.button = props.button || 0;
    this.ctrlKey = props.ctrlKey || false;
    this.pointerType = props.pointerType || 'mouse';
  }
}
global.PointerEvent = MockPointerEvent as any;
global.HTMLElement.prototype.scrollIntoView = vi.fn();
global.HTMLElement.prototype.releasePointerCapture = vi.fn();
global.HTMLElement.prototype.hasPointerCapture = vi.fn();

const mockDocuments = {
  'd1': { id: 'd1', name: 'Project Specs.pdf', type: 'pdf', createdAt: new Date().toISOString() }
};

// Mock store hooks
vi.mock('@/stores', () => ({
  useUIStore: vi.fn(() => ({
    searchOpen: true,
    closeSearch: vi.fn(),
    openSettings: vi.fn(),
    openDocuments: vi.fn(),
    toggleSidebar: vi.fn(),
    toggleFocusMode: vi.fn(),
    openSearch: vi.fn(),
  })),
  useConversationStore: vi.fn((selector) => {
    if (selector) return selector({ conversations: mockConversations });
    return {
      conversations: mockConversations,
      load: vi.fn(),
      create: vi.fn(),
    };
  }),
  useDocumentStore: vi.fn((selector) => {
    if (selector) return selector({ documents: mockDocuments });
    return {
      documents: mockDocuments
    };
  })
}));

// Mock API services to avoid network calls
vi.mock('@/services/api', () => ({
  MODEL_CONFIGS: {
    'gpt-4o': { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' }
  },
  sendMessage: vi.fn()
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('Phase 1 Features', () => {
  
  describe('SearchModal', () => {
    it('renders and filters results based on input', () => {
      render(<SearchModal />);
      
      const input = screen.getByPlaceholderText(/Type a command or search.../i);
      
      // Should show initial state
      expect(screen.getByText('New Conversation')).toBeInTheDocument();
      
      // Filter for "React"
      fireEvent.change(input, { target: { value: 'React' } });
      
      expect(screen.getByText('React Testing')).toBeInTheDocument();
      expect(screen.queryByText('Python Scripts')).not.toBeInTheDocument();
    });

    it('filters documents', () => {
      render(<SearchModal />);
      const input = screen.getByPlaceholderText(/Type a command or search.../i);
      
      fireEvent.change(input, { target: { value: 'Specs' } });
      
      expect(screen.getByText('Project Specs.pdf')).toBeInTheDocument();
    });
  });

  describe('InputBox (Slash Commands)', () => {
    it('shows prompt templates when typing "/"', async () => {
      render(
        <InputBox 
          onSend={vi.fn()} 
          disabled={false} 
          isLoading={false} 
          currentModel="gpt-4o" 
          onModelChange={vi.fn()} 
          hasMessages={false} 
          onStop={vi.fn()} 
        />
      );
      
      const textarea = screen.getByPlaceholderText(/Ask me anything/i);
      
      // Type slash
      fireEvent.keyDown(textarea, { key: '/' });
      fireEvent.change(textarea, { target: { value: '/' } });
      
      // Check for template options
      // Note: We need to make sure BUILT_IN_PROMPTS are showing
      const promptOption = await screen.findByText(/Deep Research/i);
      expect(promptOption).toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('registers event listeners', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      const { unmount } = renderHook(() => useKeyboardShortcuts());
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      
      unmount();
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });

});
