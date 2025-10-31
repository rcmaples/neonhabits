import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useDailies } from "@/hooks/use-dailies";
import { useToast } from "@/hooks/use-toast";

interface DailyFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function DailyForm({ onSuccess, onCancel }: DailyFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const { createDaily, isCreating } = useDailies();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Daily routine title is required",
      });
      return;
    }

    try {
      await createDaily({
        title: title.trim(),
        description: description.trim() || undefined,
        difficulty,
      });
      
      toast({
        title: "Daily Routine Created!",
        description: "New daily habit added to your routine",
      });
      
      // Reset form
      setTitle("");
      setDescription("");
      setDifficulty("medium");
      
      onSuccess?.();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create daily routine",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="daily-title" className="text-primary font-medium">
          Daily Routine Title *
        </Label>
        <Input
          id="daily-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter daily routine..."
          className="bg-background border-border focus:border-primary text-foreground"
          data-testid="input-daily-title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="daily-description" className="text-primary font-medium">
          Description
        </Label>
        <Textarea
          id="daily-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detailed description of this daily routine..."
          className="bg-background border-border focus:border-primary text-foreground min-h-[80px]"
          data-testid="input-daily-description"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-primary font-medium">Difficulty Level</Label>
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger className="bg-background border-border focus:border-primary text-foreground" data-testid="select-daily-difficulty">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="easy">EASY (20 XP • 8₡)</SelectItem>
            <SelectItem value="medium">MEDIUM (30 XP • 12₡)</SelectItem>
            <SelectItem value="hard">HARD (40 XP • 16₡)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="submit"
          disabled={isCreating}
          className="flex-1 bg-primary hover:bg-primary/80 text-primary-foreground"
          data-testid="button-create-daily"
        >
          <Plus className="w-4 h-4 mr-2" />
          {isCreating ? "Creating..." : "Create Daily Routine"}
        </Button>
        
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-border hover:bg-muted/10"
            data-testid="button-cancel-daily"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}