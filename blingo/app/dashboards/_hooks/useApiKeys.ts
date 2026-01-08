"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { ApiKey } from "../_types";

interface ApiKeyResponse {
  id: string;
  name: string;
  key: string;
  usage: number;
  created_at: string;
}

interface UseApiKeysReturn {
  apiKeys: ApiKey[];
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  createKey: (name?: string) => Promise<boolean>;
  updateKey: (id: string, name: string) => Promise<boolean>;
  deleteKey: (id: string) => Promise<boolean>;
  totalUsage: number;
}

export function useApiKeys(): UseApiKeysReturn {
  const { data: session, status } = useSession();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalUsage = apiKeys.reduce((sum, k) => sum + k.usage, 0);

  // Helper to get auth headers with user email from session
  const getAuthHeaders = useCallback((): HeadersInit => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    
    if (session?.user?.email) {
      headers["X-User-Email"] = session.user.email;
    }
    
    return headers;
  }, [session?.user?.email]);

  const fetchApiKeys = useCallback(async () => {
    // Wait for session to be loaded
    if (status === "loading") return;
    
    // Don't fetch if not authenticated
    if (status === "unauthenticated" || !session?.user?.email) {
      setIsLoading(false);
      setError("Please sign in to view API keys");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/api-keys", {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch API keys");
      }

      const { data } = await response.json();

      const keys: ApiKey[] = (data as ApiKeyResponse[]).map((row) => ({
        id: row.id,
        name: row.name,
        key: row.key,
        usage: row.usage,
      }));
      setApiKeys(keys);
    } catch (err) {
      console.error("Error fetching API keys:", err);
      setError(err instanceof Error ? err.message : "Failed to load API keys.");
    } finally {
      setIsLoading(false);
    }
  }, [status, session?.user?.email, getAuthHeaders]);

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const createKey = useCallback(async (name?: string): Promise<boolean> => {
    if (!session?.user?.email) {
      setError("Please sign in to create API keys");
      return false;
    }
    setError(null);

    try {
      const response = await fetch("/api/api-keys", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: name?.trim() || "" }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create API key");
      }

      const { data } = await response.json();

      setApiKeys((prev) => [
        { id: data.id, name: data.name, key: data.key, usage: data.usage },
        ...prev,
      ]);
      return true;
    } catch (err) {
      console.error("Error creating API key:", err);
      setError(err instanceof Error ? err.message : "Failed to create API key.");
      return false;
    }
  }, [session?.user?.email, getAuthHeaders]);

  const updateKey = useCallback(async (id: string, name: string): Promise<boolean> => {
    if (!name.trim()) return false;
    if (!session?.user?.email) {
      setError("Please sign in to update API keys");
      return false;
    }
    setError(null);

    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update API key");
      }

      setApiKeys((prev) =>
        prev.map((k) => (k.id === id ? { ...k, name: name.trim() } : k))
      );
      return true;
    } catch (err) {
      console.error("Error updating API key:", err);
      setError(err instanceof Error ? err.message : "Failed to update API key.");
      return false;
    }
  }, [session?.user?.email, getAuthHeaders]);

  const deleteKey = useCallback(async (id: string): Promise<boolean> => {
    if (!session?.user?.email) {
      setError("Please sign in to delete API keys");
      return false;
    }
    setError(null);
    
    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete API key");
      }

      setApiKeys((prev) => prev.filter((k) => k.id !== id));
      return true;
    } catch (err) {
      console.error("Error deleting API key:", err);
      setError(err instanceof Error ? err.message : "Failed to delete API key.");
      return false;
    }
  }, [session?.user?.email, getAuthHeaders]);

  return {
    apiKeys,
    isLoading,
    error,
    clearError,
    createKey,
    updateKey,
    deleteKey,
    totalUsage,
  };
}
