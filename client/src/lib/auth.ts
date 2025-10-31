// Legacy auth file - functionality moved to useAuth hook
// This file is kept for backward compatibility during migration

export function getAuthHeaders(): Record<string, string> {
  // Headers are no longer needed with Replit Auth session-based authentication
  return {};
}
