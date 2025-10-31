import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import type { Habit, HabitCompletion } from "@shared/schema";

export function useHabits() {
  const queryClient = useQueryClient();

  const { data: habits = [], isLoading } = useQuery<Habit[]>({
    queryKey: ["/api/habits"],
    queryFn: async () => {
      const response = await fetch("/api/habits", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch habits");
      }
      return response.json();
    },
  });

  const completeHabitMutation = useMutation({
    mutationFn: async (habitId: string) => {
      const response = await apiRequest("POST", `/api/habits/${habitId}/complete`);
      return response.json();
    },
    onSuccess: (completion: HabitCompletion, habitId: string) => {
      // Update habit streak and last completed
      queryClient.setQueryData(["/api/habits"], (oldHabits: Habit[] = []) =>
        oldHabits.map((habit) =>
          habit.id === habitId
            ? { ...habit, streak: habit.streak + 1, lastCompleted: new Date().toISOString() }
            : habit
        )
      );
      
      // Invalidate character data to refresh XP/credits
      queryClient.invalidateQueries({ queryKey: ["/api/character"] });
    },
  });

  const createHabitMutation = useMutation({
    mutationFn: async (habitData: { title: string; description?: string; difficulty: string; color: string }) => {
      const response = await apiRequest("POST", "/api/habits", habitData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
    },
  });

  return {
    habits,
    isLoading,
    completeHabit: completeHabitMutation.mutateAsync,
    createHabit: createHabitMutation.mutateAsync,
    isCompleting: completeHabitMutation.isPending,
    isCreating: createHabitMutation.isPending,
  };
}
