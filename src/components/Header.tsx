// import { Menu, ChevronDown } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { SettingsModal } from "@/components/SettingsModal";
// import { CompactContextPanel } from "@/components/CompactContextPanel";
// import { RecentChatsDropdown } from "@/components/RecentChatsDropdown";
// import { Settings, Conversation, SidebarState } from "@/types";
// import { motion, AnimatePresence } from "framer-motion";

// interface HeaderProps {
//   sidebarState: SidebarState;
//   activeConversation: Conversation | null;
//   conversations: Record<string, Conversation>;
//   settings: Settings;
//   currentModel: string;
//   lastAutoSummary: { timestamp: string; tokensSaved: number } | null;
//   disabled: boolean;
//   onToggleSidebar: () => void;
//   onSelectConversation: (id: string) => void;
//   onSummarize: () => void;
//   onStartFresh: () => void;
//   onExport: () => void;
//   onUpdateSettings: (settings: Partial<Settings>) => void;
// }

// export function Header({
//   sidebarState,
//   activeConversation,
//   conversations,
//   settings,
//   currentModel,
//   lastAutoSummary,
//   disabled,
//   onToggleSidebar,
//   onSelectConversation,
//   onSummarize,
//   onStartFresh,
//   onExport,
//   onUpdateSettings,
// }: HeaderProps) {
//   console.log("🎨 Header render - sidebarState:", sidebarState);

//   return (
//     <header className="flex items-center justify-between border-b border-border bg-card px-4 md:px-6 py-4 flex-shrink-0 gap-4">
//       {/* Left Side */}
//       <div className="flex items-center gap-3 min-w-0 flex-1">
//         <Button
//           variant="ghost"
//           size="icon"
//           onClick={() => {
//             console.log("🔘 Hamburger clicked");
//             onToggleSidebar();
//           }}
//           className="flex-shrink-0"
//         >
//           <Menu className="h-5 w-5" />
//         </Button>

//         <AnimatePresence mode="wait">
//           {sidebarState === "hidden" ? (
//             <motion.div
//               key="recent-chats"
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               exit={{ opacity: 0, x: -20 }}
//               transition={{ duration: 0.2 }}
//             >
//               <RecentChatsDropdown
//                 conversations={conversations}
//                 activeId={activeConversation?.id || null}
//                 onSelectConversation={onSelectConversation}
//               />
//             </motion.div>
//           ) : (
//             <motion.div
//               key="title"
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               exit={{ opacity: 0, x: -20 }}
//               transition={{ duration: 0.2 }}
//               className="min-w-0 flex-1"
//             >
//               <h1 className="text-lg md:text-xl font-bold truncate">
//                 {activeConversation?.title || "Context Manager"}
//               </h1>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>

//       {/* Right Side */}
//       <div className="flex items-center gap-3 flex-shrink-0">
//         {activeConversation && (
//           <CompactContextPanel
//             conversation={activeConversation}
//             currentModel={currentModel}
//             lastAutoSummary={lastAutoSummary}
//             disabled={disabled}
//             onSummarize={onSummarize}
//             onStartFresh={onStartFresh}
//             onExport={onExport}
//           />
//         )}

//         <SettingsModal settings={settings} onSave={onUpdateSettings} />
//       </div>
//     </header>
//   );
// }
import { DollarSign, Cpu, MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsModal } from "@/components/SettingsModal";
import { CompactContextPanel } from "@/components/CompactContextPanel";
import { Settings, Conversation, SidebarState } from "@/types";
import { motion } from "framer-motion";
import { CostDashboard } from "@/components/cost/CostDashboard";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";

interface HeaderProps {
  sidebarState: SidebarState;
  activeConversation: Conversation | null;
  conversations: Record<string, Conversation>;
  settings: Settings;
  currentModel: string;
  lastAutoSummary: { timestamp: string; tokensSaved: number } | null;
  disabled: boolean;
  activeView: "benchmark" | "chat";
  onViewChange: (view: "benchmark" | "chat") => void;
  onSelectConversation: (id: string) => void;
  onSummarize: () => void;
  onStartFresh: () => void;
  onExport: () => void;
  onUpdateSettings: (settings: Partial<Settings>) => void;
}

export function Header({
  sidebarState,
  activeConversation,
  conversations,
  settings,
  currentModel,
  lastAutoSummary,
  disabled,
  activeView,
  onViewChange,
  onSelectConversation,
  onSummarize,
  onStartFresh,
  onExport,
  onUpdateSettings,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-4 md:px-6 py-3 flex-shrink-0 gap-4">
      {/* Left Side: Branding & Mode Switcher */}
      <div className="flex items-center gap-4 min-w-0">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => onViewChange("benchmark")}
        >
          <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-black text-base shadow-sm">
            C
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-extrabold tracking-tight text-foreground">
                Contexta
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                Phase - I
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground hidden sm:block font-medium">
              Context Optimization for LLMs
            </p>
          </div>
        </motion.div>

        {/* View Switcher Tabs */}
        <div className="flex items-center rounded-lg bg-muted/60 p-1 border border-border/60">
          <button
            type="button"
            onClick={() => onViewChange("benchmark")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeView === "benchmark"
                ? "bg-card text-primary shadow-sm border border-border/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Cpu className="h-3.5 w-3.5" />
            <span>Benchmark Lab</span>
          </button>
          <button
            type="button"
            onClick={() => onViewChange("chat")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeView === "chat"
                ? "bg-card text-foreground shadow-sm border border-border/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Chat Studio</span>
          </button>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        {activeView === "chat" && activeConversation && (
          <CompactContextPanel
            conversation={activeConversation}
            currentModel={currentModel}
            lastAutoSummary={lastAutoSummary}
            disabled={disabled}
            onSummarize={onSummarize}
            onStartFresh={onStartFresh}
            onExport={onExport}
          />
        )}

        <SettingsModal settings={settings} onSave={onUpdateSettings} />

        {/* Cost Dashboard Trigger */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" title="Cost Dashboard">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl p-0 overflow-hidden">
            <DialogTitle className="sr-only">Cost Dashboard</DialogTitle>
            <div className="max-h-[80vh] overflow-y-auto">
              <CostDashboard />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
export default Header;
