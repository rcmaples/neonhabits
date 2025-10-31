import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/auth";
import type { Character } from "@shared/schema";

export function useCharacter() {
  const queryClient = useQueryClient();

  const { data: character, isLoading, error } = useQuery<Character>({
    queryKey: ["/api/character"],
    queryFn: async () => {
      const response = await fetch("/api/character", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch character");
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const updateCharacter = (updates: Partial<Character>) => {
    if (character) {
      queryClient.setQueryData(["/api/character"], { ...character, ...updates });
    }
  };

  return {
    character,
    isLoading,
    error,
    updateCharacter,
  };
}
