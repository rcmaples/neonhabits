import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import type { Todo } from "@shared/schema";

export function useTodos() {
  const queryClient = useQueryClient();

  const { data: todos = [], isLoading } = useQuery<Todo[]>({
    queryKey: ["/api/todos"],
    queryFn: async () => {
      const response = await fetch("/api/todos", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch todos");
      }
      return response.json();
    },
  });

  const completeTodoMutation = useMutation({
    mutationFn: async (todoId: string) => {
      const response = await apiRequest("POST", `/api/todos/${todoId}/complete`);
      return response.json();
    },
    onSuccess: (completedTodo: Todo) => {
      // Update todo completion status
      queryClient.setQueryData(["/api/todos"], (oldTodos: Todo[] = []) =>
        oldTodos.map((todo) =>
          todo.id === completedTodo.id
            ? { ...todo, isCompleted: true, completedAt: new Date().toISOString() }
            : todo
        )
      );
      
      // Invalidate character data to refresh XP/credits
      queryClient.invalidateQueries({ queryKey: ["/api/character"] });
    },
  });

  const createTodoMutation = useMutation({
    mutationFn: async (todoData: { title: string; description?: string; priority: string; dueDate?: string }) => {
      const response = await apiRequest("POST", "/api/todos", todoData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
    },
  });

  return {
    todos,
    isLoading,
    completeTodo: completeTodoMutation.mutateAsync,
    createTodo: createTodoMutation.mutateAsync,
    isCompleting: completeTodoMutation.isPending,
    isCreating: createTodoMutation.isPending,
  };
}
