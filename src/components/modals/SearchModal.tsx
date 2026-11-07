import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { 
  Settings, 
  MessageSquare,
  FileText,
  Plus,
} from "lucide-react";
import { useUIStore, useConversationStore, useDocumentStore } from "@/stores";
import { useState, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";

export function SearchModal() {
  const { searchOpen, closeSearch, openSettings, openDocuments } = useUIStore();
  const conversationsMap = useConversationStore((state) => state.conversations);
  const documentsMap = useDocumentStore((state) => state.documents);
  const { load, create } = useConversationStore();
  const [query, setQuery] = useState("");

  const conversations = useMemo(() => {
    return Object.values(conversationsMap).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [conversationsMap]);

  const documents = useMemo(() => {
    return Object.values(documentsMap).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [documentsMap]);

  // Filter items based on query
  const filteredConversations = useMemo(() => {
    if (!query) return conversations.slice(0, 5);
    return conversations.filter(c => 
      c.title.toLowerCase().includes(query.toLowerCase()) || 
      c.messages.some(m => m.content.toLowerCase().includes(query.toLowerCase()))
    ).slice(0, 5);
  }, [conversations, query]);

  const filteredDocuments = useMemo(() => {
    if (!query) return documents.slice(0, 5);
    return documents.filter(d => 
      d.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
  }, [documents, query]);

  const handleSelectConversation = (id: string) => {
    load(id);
    closeSearch();
  };

  const handleCreateNew = () => {
    create("gpt-4o"); // Default model, should be dynamic
    closeSearch();
  };

  return (
    <CommandDialog open={searchOpen} onOpenChange={closeSearch}>
      <CommandInput 
        placeholder="Type a command or search..." 
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        {/* Actions Group */}
        <CommandGroup heading="Actions">
          <CommandItem onSelect={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            <span>New Conversation</span>
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => { openDocuments(); closeSearch(); }}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Manage Documents</span>
            <CommandShortcut>⌘D</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => { openSettings(); closeSearch(); }}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
            <CommandShortcut>⌘,</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        
        <CommandSeparator />

        {/* Conversations Group */}
        {filteredConversations.length > 0 && (
          <CommandGroup heading="Recent Conversations">
            {filteredConversations.map((conv) => (
              <CommandItem key={conv.id} onSelect={() => handleSelectConversation(conv.id)}>
                <MessageSquare className="mr-2 h-4 w-4" />
                <span>{conv.title}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(conv.created_at), { addSuffix: true })}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Documents Group */}
        {filteredDocuments.length > 0 && (
          <CommandGroup heading="Documents">
            {filteredDocuments.map((doc) => (
              <CommandItem key={doc.id} onSelect={() => { /* Preview doc logic */ closeSearch(); }}>
                <FileText className="mr-2 h-4 w-4" />
                <span>{doc.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {doc.type.toUpperCase()}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

      </CommandList>
    </CommandDialog>
  );
}
