import { useConversationStore } from "@/stores";
import { calculateConversationCost, formatCost } from "@/services/costService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DollarSign, TrendingUp, BarChart3, PieChart } from "lucide-react";
import { MODEL_CONFIGS } from "@/services/api";

export function CostDashboard() {
  const conversations = useConversationStore((state) => state.conversations);
  
  const allConversations = Object.values(conversations);
  
  const totalCost = allConversations.reduce((acc, conv) => {
    return acc + calculateConversationCost(conv.messages);
  }, 0);

  const costByModel = allConversations.reduce((acc, conv) => {
    const model = conv.metadata.model; // e.g., "GPT-4o"
    const cost = calculateConversationCost(conv.messages);
    acc[model] = (acc[model] || 0) + cost;
    return acc;
  }, {} as Record<string, number>);

  const sortedModels = Object.entries(costByModel).sort(([, a], [, b]) => b - a);

  // Top 5 most expensive conversations
  const topConversations = [...allConversations]
    .map(conv => ({
        id: conv.id,
        title: conv.title,
        cost: calculateConversationCost(conv.messages),
        messageCount: conv.messages.length
    }))
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 5);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 p-4">
      {/* Summary Card */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-1 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Total Spend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            {formatCost(totalCost)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Across {allConversations.length} conversations
          </p>
        </CardContent>
      </Card>

      {/* Model Breakdown */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
             <PieChart className="h-4 w-4" />
             Spend by Model
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
            {sortedModels.length === 0 && <p className="text-sm text-muted-foreground">No data yet.</p>}
            {sortedModels.map(([modelName, cost]) => {
                const percentage = totalCost > 0 ? (cost / totalCost) * 100 : 0;
                return (
                    <div key={modelName} className="flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-2">
                            <span className="text-sm font-medium w-32 truncate">{modelName}</span>
                            <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-indigo-500 rounded-full" 
                                    style={{ width: `${percentage}%` }} 
                                />
                            </div>
                        </div>
                        <span className="text-sm text-muted-foreground tabular-nums w-16 text-right">
                            {formatCost(cost)}
                        </span>
                    </div>
                );
            })}
        </CardContent>
      </Card>

      {/* Top Consumers */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-1">
        <CardHeader className="pb-2">
           <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Top Conversations
           </CardTitle>
        </CardHeader>
        <CardContent>
           <ScrollArea className="h-[150px]">
               <div className="space-y-3">
                   {topConversations.length === 0 && <p className="text-sm text-muted-foreground">No conversations.</p>}
                   {topConversations.map(conv => (
                       <div key={conv.id} className="flex flex-col">
                           <span className="text-sm font-medium truncate">{conv.title}</span>
                           <div className="flex justify-between text-xs text-muted-foreground">
                               <span>{conv.messageCount} msgs</span>
                               <span className="font-mono">{formatCost(conv.cost)}</span>
                           </div>
                       </div>
                   ))}
               </div>
           </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
