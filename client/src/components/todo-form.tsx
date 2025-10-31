import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { useTodos } from "@/hooks/use-todos";
import { useToast } from "@/hooks/use-toast";

interface TodoFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TodoForm({ onSuccess, onCancel }: TodoFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const { createTodo, isCreating } = useTodos();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Mission title is required",
      });
      return;
    }

    try {
      await createTodo({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate: dueDate?.toISOString(),
      });
      
      toast({
        title: "Mission Created!",
        description: "New objective added to your mission log",
      });
      
      // Reset form
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate(undefined);
      
      onSuccess?.();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create mission",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="todo-title" className="text-primary font-medium">
          Mission Title *
        </Label>
        <Input
          id="todo-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter mission objective..."
          className="bg-background border-border focus:border-primary text-foreground"
          data-testid="input-todo-title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="todo-description" className="text-primary font-medium">
          Mission Brief
        </Label>
        <Textarea
          id="todo-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detailed mission description (optional)..."
          className="bg-background border-border focus:border-primary text-foreground min-h-[80px]"
          data-testid="input-todo-description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-primary font-medium">Priority Level</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="bg-background border-border focus:border-primary text-foreground" data-testid="select-todo-priority">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="low">LOW (50 XP • 25₡)</SelectItem>
              <SelectItem value="medium">MEDIUM (75 XP • 38₡)</SelectItem>
              <SelectItem value="high">HIGH (100 XP • 50₡)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-primary font-medium">Due Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start bg-background border-border hover:border-primary text-foreground"
                data-testid="button-todo-due-date"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-card border-border">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={setDueDate}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="submit"
          disabled={isCreating}
          className="flex-1 bg-accent hover:bg-accent/80 text-accent-foreground"
          data-testid="button-create-todo"
        >
          <Plus className="w-4 h-4 mr-2" />
          {isCreating ? "Creating..." : "Create Mission"}
        </Button>
        
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-border hover:bg-muted/10"
            data-testid="button-cancel-todo"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}