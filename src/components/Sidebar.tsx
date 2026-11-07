import { motion } from "framer-motion";
import {
  MessageSquarePlus,
  Menu,
  Search,
  XIcon,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Conversation, SidebarState } from "@/types";
import { AnimatePresence } from "framer-motion";
import * as Tooltip from "@radix-ui/react-tooltip";
import { useState, useMemo } from "react";
import { ConversationItem } from "./sidebar/ConversationItem";
import { useUIStore } from "@/stores";
import { ResearchToggle } from "@/components/research/ResearchToggle";

interface SidebarProps {
  conversations: Record<string, Conversation>;
  activeId: string | null;
  onNewConversation: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  sidebarState: SidebarState;
  sidebarWidth: number;
  onToggleSidebar: () => void;
}

export function Sidebar({
  conversations,
  activeId,
  onNewConversation,
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation,
  sidebarState,
  sidebarWidth,
  onToggleSidebar,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const allConversations = useMemo(() => {
    return Object.values(conversations).sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [conversations]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) {
      return allConversations;
    }

    const query = searchQuery.toLowerCase().trim();
    return allConversations.filter((conv) => {
      const titleMatch = conv.title.toLowerCase().includes(query);
      const contentMatch = conv.messages.some((msg) =>
        msg.content.toLowerCase().includes(query)
      );
      return titleMatch || contentMatch;
    });
  }, [allConversations, searchQuery]);

  if (import.meta.env.DEV) {
    console.log(
      "🎨 Sidebar render - state:",
      sidebarState,
      "width:",
      sidebarWidth
    );
  }

  // Collapsed state
  if (sidebarState === "collapsed") {
    return (
      <motion.aside
        initial={{ width: sidebarWidth }}
        animate={{ width: 70, opacity: 1 }}
        exit={{ width: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="h-screen flex-col bg-sidebar flex-shrink-0 hidden md:flex"
      >
        <div className="flex flex-col items-center gap-2 p-3">
          {/* Hamburger */}
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <Button
                  onClick={() => onToggleSidebar()}
                  size="icon"
                  variant="ghost"
                  className="w-12 h-12"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  side="right"
                  className="z-50 rounded-md bg-popover px-3 py-1.5 text-sm shadow-md"
                >
                  Expand sidebar
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>

          {/* New Chat Icon */}
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <Button
                  onClick={() => onNewConversation()}
                  size="icon"
                  variant="ghost"
                  className="w-12 h-12"
                >
                  <MessageSquarePlus className="h-5 w-5" />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  side="right"
                  className="z-50 rounded-md bg-popover px-3 py-1.5 text-sm shadow-md"
                >
                  New conversation
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        </div>
      </motion.aside>
    );
  }

  // Full state
  return (
    <motion.aside
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: sidebarWidth, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-screen flex-col bg-sidebar flex-shrink-0 hidden md:flex"
      style={{ width: sidebarWidth }}
    >
      {/* Top Section */}
      <div className="p-3 space-y-2">
        <Button
          onClick={() => onToggleSidebar()}
          size="icon"
          variant="ghost"
          className="w-12 h-12"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Button
          onClick={() => onNewConversation()}
          variant="ghost"
          className="w-full justify-start h-12 text-base hover:bg-accent"
        >
          <MessageSquarePlus className="mr-3 h-5 w-5" />
          New chat
        </Button>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8 h-9 text-sm"
          />
          {searchQuery && (
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => setSearchQuery("")}
            >
              <XIcon className="h-3 w-3" />
            </Button>
          )}
        </div>

        <Button
          onClick={() => useUIStore.getState().openDocuments()}
          variant="outline"
          className="w-full justify-start h-9 text-sm font-medium"
        >
          <FileText className="mr-2 h-4 w-4" />
          Documents
        </Button>
      </div>

      {/* Recent Section */}
      <div className="px-4 py-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {searchQuery
            ? `Search Results (${filteredConversations.length})`
            : "Recent"}
        </h3>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1 px-2 pb-4">
        <AnimatePresence>
          {filteredConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              activeId={activeId}
              searchQuery={searchQuery}
              onSelectConversation={onSelectConversation}
              onDeleteConversation={onDeleteConversation}
              onRenameConversation={onRenameConversation}
            />
          ))}
        </AnimatePresence>

        {filteredConversations.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-12 text-center text-muted-foreground px-4"
          >
            {searchQuery ? (
              <>
                <p className="text-sm">No conversations found.</p>
                <p className="mt-1 text-xs">Try a different search term.</p>
              </>
            ) : (
              <>
                <p className="text-sm">No conversations yet.</p>
                <p className="mt-1 text-xs">Click "New chat" to start!</p>
              </>
            )}
          </motion.div>
        )}
      </ScrollArea>
      
      {/* Research Mode Toggle */}
      <div className="p-3 border-t bg-muted/20">
        <ResearchToggle />
      </div>
    </motion.aside>
  );
}
