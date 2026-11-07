import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { Document, DocumentType } from '@/types';

// ================================
// Types
// ================================

interface DocumentState {
    documents: Record<string, Document>;
    isUploading: boolean;
    uploadProgress: number;
}

interface DocumentActions {
    // CRUD
    add: (document: Document) => void;
    remove: (id: string) => void;
    update: (id: string, updates: Partial<Document>) => void;

    // Bulk operations
    setDocuments: (documents: Record<string, Document>) => void;
    clear: () => void;

    // Upload state
    setUploading: (isUploading: boolean) => void;
    setProgress: (progress: number) => void;

    // Search
    search: (query: string) => Document[];
}

type DocumentStore = DocumentState & DocumentActions;

// ================================
// Store
// ================================

export const useDocumentStore = create<DocumentStore>()(
    devtools(
        persist(
            (set, get) => ({
                // State
                documents: {},
                isUploading: false,
                uploadProgress: 0,

                // Add document
                add: (document: Document) => {
                    set((state) => ({
                        documents: {
                            ...state.documents,
                            [document.id]: document,
                        },
                    }));
                },

                // Remove document
                remove: (id: string) => {
                    set((state) => {
                        const { [id]: removed, ...remaining } = state.documents;
                        return { documents: remaining };
                    });
                },

                // Update document
                update: (id: string, updates: Partial<Document>) => {
                    set((state) => {
                        const doc = state.documents[id];
                        if (!doc) return state;

                        return {
                            documents: {
                                ...state.documents,
                                [id]: { ...doc, ...updates },
                            },
                        };
                    });
                },

                // Set all documents
                setDocuments: (documents: Record<string, Document>) => {
                    set({ documents });
                },

                // Clear all
                clear: () => {
                    set({ documents: {} });
                },

                // Upload state
                setUploading: (isUploading: boolean) => {
                    set({ isUploading, uploadProgress: isUploading ? 0 : 100 });
                },

                setProgress: (uploadProgress: number) => {
                    set({ uploadProgress });
                },

                // Search documents
                search: (query: string) => {
                    const docs = Object.values(get().documents);
                    if (!query.trim()) return docs;

                    const lowerQuery = query.toLowerCase();
                    return docs.filter((doc) =>
                        doc.name.toLowerCase().includes(lowerQuery) ||
                        doc.content.toLowerCase().includes(lowerQuery)
                    );
                },
            }),
            {
                name: 'contexta-documents',
                partialize: (state) => ({
                    documents: state.documents,
                }),
            }
        ),
        { name: 'DocumentStore' }
    )
);

// ================================
// Selectors
// ================================

export const selectAllDocuments = (state: DocumentStore) =>
    Object.values(state.documents).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

export const selectDocumentById = (id: string) => (state: DocumentStore) =>
    state.documents[id];

export const selectDocumentsByType = (type: DocumentType) => (state: DocumentStore) =>
    Object.values(state.documents).filter((doc) => doc.type === type);
