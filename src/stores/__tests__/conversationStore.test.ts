import { describe, it, expect, beforeEach } from 'vitest';
import { useConversationStore } from '../conversationStore';

describe('conversationStore', () => {
    beforeEach(() => {
        // Reset store before each test
        useConversationStore.getState().clear();
    });

    describe('create', () => {
        it('should create a new conversation', () => {
            const id = useConversationStore.getState().create();

            expect(id).toBeDefined();
            expect(id).toMatch(/^conv-/);

            const conversation = useConversationStore.getState().conversations[id];
            expect(conversation).toBeDefined();
            expect(conversation.title).toBe('New Conversation');
            expect(conversation.messages).toHaveLength(0);
        });

        it('should set the new conversation as active', () => {
            const id = useConversationStore.getState().create();
            expect(useConversationStore.getState().activeId).toBe(id);
        });
    });

    describe('load', () => {
        it('should set activeId to the specified conversation', () => {
            const id = useConversationStore.getState().create();
            useConversationStore.getState().create(); // Create another

            useConversationStore.getState().load(id);
            expect(useConversationStore.getState().activeId).toBe(id);
        });
    });

    describe('delete', () => {
        it('should remove the conversation', () => {
            const id = useConversationStore.getState().create();
            expect(useConversationStore.getState().conversations[id]).toBeDefined();

            useConversationStore.getState().delete(id);
            expect(useConversationStore.getState().conversations[id]).toBeUndefined();
        });

        it('should clear activeId if deleting active conversation', () => {
            const id = useConversationStore.getState().create();
            expect(useConversationStore.getState().activeId).toBe(id);

            useConversationStore.getState().delete(id);
            expect(useConversationStore.getState().activeId).toBeNull();
        });
    });

    describe('rename', () => {
        it('should update the conversation title', () => {
            const id = useConversationStore.getState().create();
            useConversationStore.getState().rename(id, 'My Research');

            expect(useConversationStore.getState().conversations[id].title).toBe('My Research');
        });
    });

    describe('addMessage', () => {
        it('should add a message to the conversation', () => {
            const id = useConversationStore.getState().create();

            useConversationStore.getState().addMessage(id, {
                id: 'msg-1',
                role: 'user',
                content: 'Hello',
                timestamp: new Date().toISOString(),
            });

            const conversation = useConversationStore.getState().conversations[id];
            expect(conversation.messages).toHaveLength(1);
            expect(conversation.messages[0].content).toBe('Hello');
        });

        it('should auto-generate title from first user message', () => {
            const id = useConversationStore.getState().create();

            useConversationStore.getState().addMessage(id, {
                id: 'msg-1',
                role: 'user',
                content: 'What is quantum computing and how does it work?',
                timestamp: new Date().toISOString(),
            });

            const conversation = useConversationStore.getState().conversations[id];
            expect(conversation.title).toBe('What is quantum computing and how does it work?');
        });
    });

    describe('fork', () => {
        it('should create a branch from a specific message', () => {
            const id = useConversationStore.getState().create();

            // Add some messages
            useConversationStore.getState().addMessage(id, {
                id: 'msg-1',
                role: 'user',
                content: 'First message',
                timestamp: new Date().toISOString(),
            });
            useConversationStore.getState().addMessage(id, {
                id: 'msg-2',
                role: 'assistant',
                content: 'Response',
                timestamp: new Date().toISOString(),
            });
            useConversationStore.getState().addMessage(id, {
                id: 'msg-3',
                role: 'user',
                content: 'Follow up',
                timestamp: new Date().toISOString(),
            });

            // Fork from msg-2
            const forkId = useConversationStore.getState().fork(id, 'msg-2');

            expect(forkId).toBeDefined();
            const forked = useConversationStore.getState().conversations[forkId];
            expect(forked.messages).toHaveLength(2); // Only msg-1 and msg-2
            expect(forked.parentId).toBe(id);
            expect(forked.forkFromMessageId).toBe('msg-2');
        });
    });
});
