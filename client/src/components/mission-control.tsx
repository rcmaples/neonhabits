import { useState } from "react";
import { useTodos } from "@/hooks/use-todos";
import { Button } from "@/components/ui/button";
import { Check, MoreHorizontal, Calendar, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TodoForm } from "@/components/todo-form";
import { useToast } from "@/hooks/use-toast";
import { format, isPast, isToday } from "date-fns";

export function MissionControl() {
  const { todos, completeTodo, isLoading } = useTodos();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleComplete = async (todoId: string) => {
    try {
      await completeTodo(todoId);
      toast({
        title: "Mission Completed!",
        description: "XP and credits gained",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to complete mission",
      });
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "HIGH PRIORITY";
      case "medium":
        return "MEDIUM";
      case "low":
        return "LOW";
      default:
        return "MEDIUM";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-destructive";
      case "medium":
        return "text-accent";
      case "low":
        return "text-primary";
      default:
        return "text-accent";
    }
  };

  const getDueDateInfo = (dueDate: string | Date | null) => {
    if (!dueDate) return null;
    
    const date = dueDate instanceof Date ? dueDate : new Date(dueDate);
    const isOverdue = isPast(date) && !isToday(date);
    const isDueToday = isToday(date);
    
    return {
      date,
      isOverdue,
      isDueToday,
      formatted: format(date, "MMM d"),
    };
  };

  // Separate completed and active todos, then sort by priority and due date
  const activeTodos = todos.filter(t => !t.isCompleted).sort((a, b) => {
    // First sort by priority
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 1;
    const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 1;
    
    if (aPriority !== bPriority) return bPriority - aPriority;
    
    // Then by due date (overdue first, then today, then future)
    const aDue = a.dueDate ? new Date(a.dueDate) : null;
    const bDue = b.dueDate ? new Date(b.dueDate) : null;
    
    if (aDue && bDue) return aDue.getTime() - bDue.getTime();
    if (aDue) return -1;
    if (bDue) return 1;
    return 0;
  });
  
  const completedTodos = todos.filter(t => t.isCompleted);

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="text-center text-muted-foreground">Loading missions...</div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-accent">MISSION CONTROL</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="px-3 py-1 bg-accent/10 text-accent rounded border border-accent/20 text-sm hover:bg-accent/20 transition-colors"
              data-testid="button-new-mission"
            >
              + NEW MISSION
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-primary">Create New Mission</DialogTitle>
            </DialogHeader>
            <TodoForm onSuccess={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-3">
        {todos.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No active missions. Create your first mission to start earning rewards!
          </div>
        ) : (
          <>
            {/* Active Missions */}
            {activeTodos.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-primary border-b border-border pb-2">
                  ACTIVE MISSIONS ({activeTodos.length})
                </h4>
                {activeTodos.map((todo) => {
                  const dueDateInfo = getDueDateInfo(todo.dueDate);
                  
                  return (
                    <div 
                      key={todo.id}
                      className={`flex items-center gap-3 p-3 rounded border transition-all group ${
                        todo.isCompleted 
                          ? "bg-accent/5 border-accent/20 hover:border-accent/40" 
                          : "bg-muted/10 border-muted/20 hover:border-accent/30"
                      }`}
                      data-testid={`todo-${todo.id}`}
                    >
                      <Button
                        size="sm"
                        onClick={() => !todo.isCompleted && handleComplete(todo.id)}
                        disabled={todo.isCompleted}
                        className={`w-5 h-5 rounded border transition-colors ${
                          todo.isCompleted
                            ? "bg-accent/20 border-accent flex items-center justify-center"
                            : "border-accent/50 hover:bg-accent/20"
                        }`}
                        data-testid={`button-complete-todo-${todo.id}`}
                      >
                        {todo.isCompleted && <Check className="w-3 h-3 text-accent" />}
                      </Button>
                      <div className="flex-1">
                        <div 
                          className={`font-medium text-sm ${
                            todo.isCompleted ? "line-through text-muted-foreground" : ""
                          }`}
                          data-testid={`todo-title-${todo.id}`}
                        >
                          {todo.title}
                        </div>
                        <div className="text-xs text-muted-foreground mono flex items-center gap-2">
                          <span className={getPriorityColor(todo.priority)}>
                            {getPriorityLabel(todo.priority)}
                          </span>
                          <span>•</span>
                          <span>+{todo.xpReward} XP • +₡{todo.creditsReward}</span>
                          {dueDateInfo && (
                            <>
                              <span>•</span>
                              <div className={`flex items-center gap-1 ${
                                dueDateInfo.isOverdue ? "text-destructive" :
                                dueDateInfo.isDueToday ? "text-accent" :
                                "text-muted-foreground"
                              }`}>
                                {dueDateInfo.isOverdue && <AlertTriangle className="w-3 h-3" />}
                                <Calendar className="w-3 h-3" />
                                <span>{dueDateInfo.formatted}</span>
                                {dueDateInfo.isOverdue && <span className="font-medium">OVERDUE</span>}
                                {dueDateInfo.isDueToday && <span className="font-medium">DUE TODAY</span>}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="p-1 hover:bg-muted/20 rounded"
                          data-testid={`button-todo-menu-${todo.id}`}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Completed Missions */}
            {completedTodos.length > 0 && (
              <div className="space-y-3 mt-6">
                <h4 className="text-sm font-medium text-muted-foreground border-b border-border pb-2">
                  COMPLETED MISSIONS ({completedTodos.length})
                </h4>
                {completedTodos.slice(0, 5).map((todo) => (
            <div 
              key={todo.id}
              className={`flex items-center gap-3 p-3 rounded border transition-all group ${
                todo.isCompleted 
                  ? "bg-accent/5 border-accent/20 hover:border-accent/40" 
                  : "bg-muted/10 border-muted/20 hover:border-accent/30"
              }`}
              data-testid={`todo-${todo.id}`}
            >
              <Button
                size="sm"
                onClick={() => !todo.isCompleted && handleComplete(todo.id)}
                disabled={todo.isCompleted}
                className={`w-5 h-5 rounded border transition-colors ${
                  todo.isCompleted
                    ? "bg-accent/20 border-accent flex items-center justify-center"
                    : "border-accent/50 hover:bg-accent/20"
                }`}
                data-testid={`button-complete-todo-${todo.id}`}
              >
                {todo.isCompleted && <Check className="w-3 h-3 text-accent" />}
              </Button>
              <div className="flex-1">
                <div 
                  className={`font-medium text-sm ${
                    todo.isCompleted ? "line-through text-muted-foreground" : ""
                  }`}
                  data-testid={`todo-title-${todo.id}`}
                >
                  {todo.title}
                </div>
                <div className="text-xs text-muted-foreground mono">
                  <span className={getPriorityColor(todo.priority)}>
                    {getPriorityLabel(todo.priority)}
                  </span>
                  {" • +"}
                  {todo.xpReward} XP • +₡{todo.creditsReward}
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="p-1 hover:bg-muted/20 rounded"
                  data-testid={`button-todo-menu-${todo.id}`}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
                ))}
                {completedTodos.length > 5 && (
                  <div className="text-center text-xs text-muted-foreground py-2">
                    ... and {completedTodos.length - 5} more completed missions
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
