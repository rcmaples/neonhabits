import { useState } from "react";
import { useDailies } from "@/hooks/use-dailies";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, MoreHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DailyForm } from "@/components/daily-form";
import { useToast } from "@/hooks/use-toast";

export function DailiesTracker() {
  const { dailies, completeDaily, isLoading } = useDailies();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleComplete = async (dailyId: string) => {
    try {
      await completeDaily(dailyId);
      toast({
        title: "Daily Completed!",
        description: "XP and credits gained • Streak continued",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to complete daily",
      });
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "hard":
        return "HARD";
      case "medium":
        return "MEDIUM";
      case "easy":
        return "EASY";
      default:
        return "MEDIUM";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "hard":
        return "text-destructive";
      case "medium":
        return "text-accent";
      case "easy":
        return "text-primary";
      default:
        return "text-accent";
    }
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return "text-yellow-400"; // Gold
    if (streak >= 14) return "text-purple-400"; // Purple
    if (streak >= 7) return "text-blue-400"; // Blue
    if (streak >= 3) return "text-green-400"; // Green
    return "text-muted-foreground";
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="text-center text-muted-foreground">Loading dailies...</div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-primary">DAILY ROUTINES</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="px-3 py-1 bg-primary/10 text-primary rounded border border-primary/20 text-sm hover:bg-primary/20 transition-colors"
              data-testid="button-new-daily"
            >
              + NEW DAILY
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-primary">Create Daily Routine</DialogTitle>
            </DialogHeader>
            <DailyForm onSuccess={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-3">
        {dailies.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No daily routines configured. Create your first daily to build consistent habits!
          </div>
        ) : (
          dailies.map((daily) => {
            const isCompleted = daily.isCompletedToday;
            const today = new Date().toISOString().split('T')[0];
            const canComplete = !isCompleted;

            return (
              <div 
                key={daily.id}
                className={`flex items-center gap-3 p-3 rounded border transition-all group ${
                  isCompleted 
                    ? "bg-primary/5 border-primary/20 hover:border-primary/40" 
                    : "bg-muted/10 border-muted/20 hover:border-primary/30"
                }`}
                data-testid={`daily-${daily.id}`}
              >
                <Button
                  size="sm"
                  onClick={() => canComplete && handleComplete(daily.id)}
                  disabled={!canComplete}
                  className={`w-6 h-6 rounded-full border transition-colors p-0 ${
                    isCompleted
                      ? "bg-primary/20 border-primary text-primary hover:bg-primary/30"
                      : "border-primary/50 hover:bg-primary/20 hover:border-primary"
                  }`}
                  data-testid={`button-complete-daily-${daily.id}`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </Button>
                
                <div className="flex-1">
                  <div 
                    className={`font-medium text-sm ${
                      isCompleted ? "line-through text-muted-foreground" : ""
                    }`}
                    data-testid={`daily-title-${daily.id}`}
                  >
                    {daily.title}
                  </div>
                  <div className="text-xs text-muted-foreground mono flex items-center gap-2">
                    <span className={getDifficultyColor(daily.difficulty)}>
                      {getDifficultyLabel(daily.difficulty)}
                    </span>
                    <span>•</span>
                    <span>+{daily.xpReward} XP • +₡{daily.creditsReward}</span>
                    <span>•</span>
                    <span className={getStreakColor(daily.streak)}>
                      🔥 {daily.streak} day streak
                    </span>
                  </div>
                </div>
                
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="p-1 hover:bg-muted/20 rounded"
                    data-testid={`button-daily-menu-${daily.id}`}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}