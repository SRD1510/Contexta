import { motion } from "framer-motion";
import {
  Trash2,
  Edit,
  X,
  Check,
  MoreVertical,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Conversation } from "@/types";
import { cn } from "@/lib/utils";
import * as Popover from "@radix-ui/react-popover";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { useState, useRef, useEffect } from "react";

interface ConversationItemProps {
  conversation: Conversation;
  activeId: string | null;
  searchQuery?: string;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
}

export function ConversationItem({
  conversation,
  activeId,
  searchQuery = "",
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation,
}: ConversationItemProps) {
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark
          key={i}
          className="bg-primary/20 text-primary-foreground rounded px-0.5"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const [open, setOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(conversation.title);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleRename = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (newTitle.trim() && newTitle.trim() !== conversation.title) {
      onRenameConversation(conversation.id, newTitle.trim());
    }
    setIsRenaming(false);
    setOpen(false);
  };

  const handleCancelRename = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setNewTitle(conversation.title);
    setIsRenaming(false);
    setOpen(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className={cn(
          "group relative rounded-xl px-3 py-2 transition-all cursor-pointer mb-1 flex items-center",
          activeId === conversation.id
            ? "bg-primary text-primary-foreground shadow-sm"
            : "hover:bg-accent"
        )}
        onClick={() => {
          if (!isRenaming) onSelectConversation(conversation.id);
        }}
      >
        {isRenaming ? (
          <div
            className="flex items-center gap-2 w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              ref={inputRef}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
                if (e.key === "Escape") handleCancelRename();
              }}
              className="flex-1 rounded border border-border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 flex-shrink-0"
              onClick={handleRename}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 flex-shrink-0"
              onClick={handleCancelRename}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 w-full">
            <MessageSquare className="h-4 w-4 flex-shrink-0 opacity-70" />
            <span className="flex-1 truncate text-sm font-medium max-w-[150px]">
              {searchQuery
                ? highlightText(conversation.title, searchQuery)
                : conversation.title}
            </span>
            <Popover.Root open={open} onOpenChange={setOpen}>
              <Popover.Trigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-7 w-7 flex-shrink-0 transition-opacity",
                    activeId === conversation.id
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  align="end"
                  sideOffset={4}
                  className="z-50 w-48 rounded-lg border bg-popover p-1 shadow-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-sm font-normal"
                    onClick={() => {
                      setIsRenaming(true);
                      setOpen(false);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Rename
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-sm font-normal text-destructive hover:text-destructive"
                    onClick={() => {
                      setShowDeleteDialog(true);
                      setOpen(false);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </div>
        )}
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog.Root
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-background p-6 shadow-xl z-50">
            <AlertDialog.Title className="text-lg font-semibold mb-2">
              Delete conversation?
            </AlertDialog.Title>
            <AlertDialog.Description className="text-sm text-muted-foreground mb-6">
              This will delete{" "}
              <strong className="text-foreground">{conversation.title}</strong>.
              This action cannot be undone.
            </AlertDialog.Description>
            <div className="flex justify-end gap-3">
              <AlertDialog.Cancel asChild>
                <Button variant="outline" size="sm">
                  Cancel
                </Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDeleteConversation(conversation.id)}
                >
                  Delete
                </Button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  );
}
