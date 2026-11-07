import { BookOpen } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSettingsStore, selectResearchMode } from "@/stores/settingsStore";
import { cn } from "@/lib/utils";

export function ResearchToggle({ className }: { className?: string }) {
  const researchMode = useSettingsStore(selectResearchMode);
  const setResearchMode = useSettingsStore((state) => state.setResearchMode);

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Switch
        id="research-mode"
        checked={researchMode ?? false}
        onCheckedChange={setResearchMode}
      />
      <Label htmlFor="research-mode" className="flex items-center gap-2 cursor-pointer">
        <BookOpen className="h-4 w-4" />
        <span>Research Mode</span>
      </Label>
    </div>
  );
}
