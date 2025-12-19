"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase, ApiKeyRow } from "@/lib/supabase";
import { ApiKey } from "../_types";
import { generateApiKey } from "../_utils/apiKeyUtils";

interface UseApiKeysReturn {
  apiKeys: ApiKey[];
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  createKey: (name: string) => Promise<boolean>;
  updateKey: (id: string, name: string) => Promise<boolean>;
  deleteKey: (id: string) => Promise<boolean>;
  totalUsage: number;
}

export function useApiKeys(): UseApiKeysReturn {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalUsage = apiKeys.reduce((sum, k) => sum + k.usage, 0);

  const fetchApiKeys = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("api_keys")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const keys: ApiKey[] = (data as ApiKeyRow[]).map((row) => ({
        id: row.id,
        name: row.name,
        key: row.key,
        usage: row.usage,
      }));
      setApiKeys(keys);
    } catch (err) {
      console.error("Error fetching API keys:", err);
      setError("Failed to load API keys. Check your Supabase connection.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const createKey = useCallback(async (name: string): Promise<boolean> => {
    if (!name.trim()) return false;
    setError(null);

    const newKey = {
      name: name.trim(),
      key: generateApiKey(),
      usage: 0,
    };

    try {
      const { data, error } = await supabase
        .from("api_keys")
        .insert([newKey])
        .select()
        .single();

      if (error) throw error;

      setApiKeys((prev) => [
        { id: data.id, name: data.name, key: data.key, usage: data.usage },
        ...prev,
      ]);
      return true;
    } catch (err) {
      console.error("Error creating API key:", err);
      setError("Failed to create API key.");
      return false;
    }
  }, []);

  const updateKey = useCallback(async (id: string, name: string): Promise<boolean> => {
    if (!name.trim()) return false;
    setError(null);

    try {
      const { error } = await supabase
        .from("api_keys")
        .update({ name: name.trim() })
        .eq("id", id);

      if (error) throw error;

      setApiKeys((prev) =>
        prev.map((k) => (k.id === id ? { ...k, name: name.trim() } : k))
      );
      return true;
    } catch (err) {
      console.error("Error updating API key:", err);
      setError("Failed to update API key.");
      return false;
    }
  }, []);

  const deleteKey = useCallback(async (id: string): Promise<boolean> => {
    setError(null);
    try {
      const { error } = await supabase.from("api_keys").delete().eq("id", id);

      if (error) throw error;

      setApiKeys((prev) => prev.filter((k) => k.id !== id));
      return true;
    } catch (err) {
      console.error("Error deleting API key:", err);
      setError("Failed to delete API key.");
      return false;
    }
  }, []);

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

