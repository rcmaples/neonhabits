import { useState } from "react";
import { useHabits } from "@/hooks/use-habits";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Flame, Calendar, MoreHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { HabitForm } from "@/components/habit-form";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export function HabitTracker() {
  const { habits, completeHabit, isLoading } = useHabits();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleComplete = async (habitId: string) => {
    try {
      await completeHabit(habitId);
      toast({
        title: "Habit Completed!",
        description: "XP and credits gained",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to complete habit",
      });
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case "primary":
        return "bg-primary glow-primary";
      case "accent":
        return "bg-accent glow-accent";
      case "cyan":
        return "bg-neon-cyan glow-cyan";
      case "yellow":
        return "bg-neon-yellow";
      default:
        return "bg-primary glow-primary";
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "EASY";
      case "hard":
        return "HARD";
      default:
        return "MEDIUM";
    }
  };

  const canCompleteToday = (lastCompleted: string | Date | null) => {
    if (!lastCompleted) return true;
    
    const lastCompletedDate = lastCompleted instanceof Date ? lastCompleted : new Date(lastCompleted);
    const today = new Date();
    
    // Check if last completed was today
    return lastCompletedDate.toDateString() !== today.toDateString();
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return "text-neon-yellow";
    if (streak >= 14) return "text-accent";
    if (streak >= 7) return "text-primary";
    return "text-muted-foreground";
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="text-center text-muted-foreground">Loading habits...</div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-primary">NEURAL HABITS</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="px-3 py-1 bg-primary/10 text-primary rounded border border-primary/20 text-sm hover:bg-primary/20 transition-colors"
              data-testid="button-new-habit"
            >
              + NEW HABIT
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-primary">Create Neural Habit</DialogTitle>
            </DialogHeader>
            <HabitForm onSuccess={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-4">
        {habits.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No neural habits established. Create your first habit to start building behavioral patterns!
          </div>
        ) : (
          habits.map((habit) => {
            const canComplete = canCompleteToday(habit.lastCompleted);
            
            return (
              <div 
                key={habit.id}
                className="group p-4 bg-background rounded-lg border border-border hover:border-primary/30 transition-all"
                data-testid={`habit-${habit.id}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${getColorClasses(habit.color)}`}></div>
                    <div>
                      <h4 className="font-medium text-foreground" data-testid={`habit-title-${habit.id}`}>
                        {habit.title}
                      </h4>
                      {habit.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {habit.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => canComplete && handleComplete(habit.id)}
                      disabled={!canComplete}
                      className={`w-8 h-8 rounded transition-colors ${
                        canComplete 
                          ? "bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20" 
                          : "bg-accent/5 border border-accent/10 text-accent/50 cursor-not-allowed"
                      }`}
                      data-testid={`button-complete-habit-${habit.id}`}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="p-1 hover:bg-muted/20 rounded"
                        data-testid={`button-habit-menu-${habit.id}`}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Flame className={`w-3 h-3 ${getStreakColor(habit.streak)}`} />
                      <span className={`mono ${getStreakColor(habit.streak)}`} data-testid={`habit-streak-${habit.id}`}>
                        {habit.streak} day streak
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <span className="mono">{getDifficultyLabel(habit.difficulty)}</span>
                      <span>•</span>
                      <span className="mono text-accent">+{habit.xpReward} XP</span>
                      <span>•</span>
                      <span className="mono text-neon-cyan">+₡{habit.creditsReward}</span>
                    </div>
                  </div>
                  
                  {habit.lastCompleted && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span className="mono text-xs">
                        {formatDistanceToNow(new Date(habit.lastCompleted), { addSuffix: true })}
                      </span>
                    </div>
                  )}
                  
                  {!canComplete && (
                    <span className="text-xs text-accent mono">
                      ✓ COMPLETED TODAY
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
