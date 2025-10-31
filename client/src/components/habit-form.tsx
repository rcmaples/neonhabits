import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Palette } from "lucide-react";
import { useHabits } from "@/hooks/use-habits";
import { useToast } from "@/hooks/use-toast";

interface HabitFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const HABIT_COLORS = [
  { value: "primary", label: "Neural Purple", class: "bg-primary" },
  { value: "accent", label: "Neon Pink", class: "bg-accent" },
  { value: "cyan", label: "Cyber Cyan", class: "bg-neon-cyan" },
  { value: "yellow", label: "Electric Yellow", class: "bg-neon-yellow" },
];

export function HabitForm({ onSuccess, onCancel }: HabitFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [color, setColor] = useState("primary");
  const { createHabit, isCreating } = useHabits();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Habit title is required",
      });
      return;
    }

    try {
      await createHabit({
        title: title.trim(),
        description: description.trim() || undefined,
        difficulty,
        color,
      });
      
      toast({
        title: "Habit Created!",
        description: "New behavior pattern added to your routine",
      });
      
      // Reset form
      setTitle("");
      setDescription("");
      setDifficulty("medium");
      setColor("primary");
      
      onSuccess?.();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create habit",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="habit-title" className="text-primary font-medium">
          Habit Title *
        </Label>
        <Input
          id="habit-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter habit to build..."
          className="bg-background border-border focus:border-primary text-foreground"
          data-testid="input-habit-title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="habit-description" className="text-primary font-medium">
          Description
        </Label>
        <Textarea
          id="habit-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe this habit and why you want to build it..."
          className="bg-background border-border focus:border-primary text-foreground min-h-[80px]"
          data-testid="input-habit-description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-primary font-medium">Difficulty Level</Label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="bg-background border-border focus:border-primary text-foreground" data-testid="select-habit-difficulty">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="easy">EASY (25 XP • 10₡)</SelectItem>
              <SelectItem value="medium">MEDIUM (38 XP • 15₡)</SelectItem>
              <SelectItem value="hard">HARD (50 XP • 20₡)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-primary font-medium">Color Theme</Label>
          <Select value={color} onValueChange={setColor}>
            <SelectTrigger className="bg-background border-border focus:border-primary text-foreground" data-testid="select-habit-color">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {HABIT_COLORS.map((colorOption) => (
                <SelectItem key={colorOption.value} value={colorOption.value}>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${colorOption.class}`}></div>
                    {colorOption.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="submit"
          disabled={isCreating}
          className="flex-1 bg-primary hover:bg-primary/80 text-primary-foreground"
          data-testid="button-create-habit"
        >
          <Plus className="w-4 h-4 mr-2" />
          {isCreating ? "Creating..." : "Create Habit"}
        </Button>
        
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-border hover:bg-muted/10"
            data-testid="button-cancel-habit"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}