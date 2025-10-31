import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import type { Daily } from "@shared/schema";

export function useDailies() {
  const queryClient = useQueryClient();

  const { data: dailies = [], isLoading } = useQuery<Daily[]>({
    queryKey: ["/api/dailies"],
    queryFn: async () => {
      const response = await fetch("/api/dailies", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch dailies");
      }
      return response.json();
    },
  });

  const completeDailyMutation = useMutation({
    mutationFn: async (dailyId: string) => {
      const response = await apiRequest("POST", `/api/dailies/${dailyId}/complete`);
      return response.json();
    },
    onSuccess: (completedDaily: Daily, dailyId: string) => {
      // Update daily completion status
      queryClient.setQueryData(["/api/dailies"], (oldDailies: Daily[] = []) =>
        oldDailies.map((daily) =>
          daily.id === dailyId
            ? { 
                ...daily, 
                isCompletedToday: true, 
                lastCompletedDate: new Date().toISOString().split('T')[0],
                streak: completedDaily.streak
              }
            : daily
        )
      );
      
      // Invalidate character data to refresh XP/credits
      queryClient.invalidateQueries({ queryKey: ["/api/character"] });
    },
  });

  const createDailyMutation = useMutation({
    mutationFn: async (dailyData: { title: string; description?: string; difficulty: string }) => {
      const response = await apiRequest("POST", "/api/dailies", dailyData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dailies"] });
    },
  });

  return {
    dailies,
    isLoading,
    completeDaily: completeDailyMutation.mutateAsync,
    createDaily: createDailyMutation.mutateAsync,
    isCompleting: completeDailyMutation.isPending,
    isCreating: createDailyMutation.isPending,
  };
}