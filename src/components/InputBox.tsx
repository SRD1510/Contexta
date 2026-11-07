import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Loader2,
  X,
  AlertTriangle,
  Mic,
  Plus,
  CircleStop,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command as CommandPrimitive,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { MODEL_CONFIGS } from "@/services/api";
import { BUILT_IN_PROMPTS } from "@/data/prompts";
import { PromptTemplate } from "@/types";

interface InputBoxProps {
  onSend: (message: string, attachments?: File[]) => void; // Updated signature
  disabled: boolean;
  isLoading: boolean;
  currentModel: string;
  onModelChange: (model: string) => void;
  hasMessages: boolean;
  onStop: () => void;
}

export function InputBox({
  onSend,
  disabled,
  isLoading,
  currentModel,
  onModelChange,
  hasMessages,
  onStop,
}: InputBoxProps) {
  const [input, setInput] = useState("");
  const [pendingModel, setPendingModel] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showPrompts, setShowPrompts] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() && attachments.length === 0) return;
    onSend(input.trim(), attachments);
    setInput("");
    setAttachments([]);
    setShowPrompts(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    
    // Slash command trigger
    if (e.key === "/" && input === "") {
      setShowPrompts(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    
    // Hide prompts if user deletes slash or types more (simple logic for now)
    if (showPrompts && !value.startsWith("/")) {
      setShowPrompts(false);
    }
    
    // Show prompts if user types slash at start
    if (value === "/") {
      setShowPrompts(true);
    }
  };

  const handleSelectPrompt = (template: PromptTemplate) => {
    setInput(template.content);
    setShowPrompts(false);
    textareaRef.current?.focus();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleModelSelect = (model: string) => {
    if (hasMessages && model !== currentModel) {
      setPendingModel(model);
      setShowWarning(true);
    } else {
      onModelChange(model);
    }
  };

  const confirmModelChange = () => {
    if (pendingModel) onModelChange(pendingModel);
    setShowWarning(false);
    setPendingModel(null);
  };

  const cancelModelChange = () => {
    setShowWarning(false);
    setPendingModel(null);
  };

  // Adjust textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full px-4 pb-4 bg-background flex justify-center sticky bottom-0 z-20"
      >
        <div className="w-full max-w-5xl flex flex-col gap-3 relative">
          
          {/* Prompt Command Menu - Positioned absolutely above the input */}
          <AnimatePresence>
            {showPrompts && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full mb-2 w-full z-50 shadow-lg rounded-lg border bg-popover overflow-hidden"
              >
                <CommandPrimitive className="w-full">
                  <CommandList className="max-h-[200px] overflow-y-auto p-1">
                    <CommandGroup heading="Prompt Templates">
                      {BUILT_IN_PROMPTS.map((prompt) => (
                        <CommandItem
                          key={prompt.id}
                          onSelect={() => handleSelectPrompt(prompt)}
                          className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-accent aria-selected:bg-accent"
                        >
                          <Sparkles className="h-4 w-4 text-primary" />
                          <span className="font-medium">{prompt.title}</span>
                          <span className="text-muted-foreground truncate flex-1 ml-2">
                            - {prompt.content.substring(0, 40)}...
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </CommandPrimitive>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Attachment Previews */}
          <AnimatePresence>
            {attachments.length > 0 && (
              <motion.div
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 overflow-x-auto p-1"
              >
                {attachments.map((file, index) => (
                  <motion.div
                    layout
                    key={index}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border bg-muted"
                  >
                    {file.type.startsWith("image/") ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="text-xs text-center p-2 text-muted-foreground truncate">
                        {file.name}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Textarea */}
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? "AI is thinking..." : "Ask me anything... (Type '/' for prompts)"}
            disabled={disabled}
            rows={1}
            className="resize-none border-none bg-background focus-visible:ring-0 focus-visible:ring-offset-0 text-lg p-4 min-h-[60px] rounded-2xl shadow-sm ring-1 ring-border focus:ring-2 focus:ring-primary/20 transition-all"
          />

          {/* Action Bar */}
          <div className="flex items-center justify-between">
            {/* Left Actions */}
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="icon">
                <label className="cursor-pointer">
                  <Plus className="h-5 w-5" />
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </Button>
              <Button variant="ghost" size="icon">
                <Mic className="h-5 w-5" />
              </Button>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Model Select */}
              <Select value={currentModel} onValueChange={handleModelSelect}>
                <SelectTrigger className="w-[150px] h-9 text-sm border-0 bg-transparent hover:bg-accent/50 focus:ring-0">
                  <SelectValue>
                    {MODEL_CONFIGS[currentModel]?.name || "Model"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {Object.entries(MODEL_CONFIGS).map(([id, config]) => (
                    <SelectItem key={id} value={id}>
                      <div className="flex items-center justify-between gap-4">
                        <span>{config.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {config.provider}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Send/Stop Button */}
              {isLoading ? (
                <Button type="button" size="icon" onClick={onStop} variant="destructive">
                  <CircleStop className="h-5 w-5" />
                </Button>
              ) : (
                <Button
                  onClick={() => handleSubmit()}
                  size="icon"
                  className={input.trim() || attachments.length > 0 ? "" : "opacity-50"}
                  disabled={disabled || (!input.trim() && attachments.length === 0)}
                >
                  <Send className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Model Switch Warning Dialog */}
      <Dialog open={showWarning} onOpenChange={setShowWarning}>
        <DialogContent className="border-destructive bg-card">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <DialogTitle>Switch Model Mid-Conversation?</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              You're about to switch from{" "}
              <span className="font-semibold text-foreground">
                {MODEL_CONFIGS[currentModel]?.name}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-foreground">
                {pendingModel && MODEL_CONFIGS[pendingModel]?.name}
              </span>
              .
              <br />
              <br />
              Different models may have different response styles, capabilities,
              and context handling.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelModelChange}>
              Cancel
            </Button>
            <Button onClick={confirmModelChange} className="gradient-primary">
              Switch Model
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
