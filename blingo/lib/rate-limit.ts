import { supabaseAdmin } from "@/lib/supabase-server";

// Default rate limit configuration
export const DEFAULT_RATE_LIMIT = 1000;

// API key data structure
export interface ApiKeyData {
  id: string;
  name: string;
  key: string;
  usage: number;
  user_id?: string;
}

// Result of API key validation
export interface ValidateApiKeyResult {
  valid: boolean;
  error?: string;
  keyData?: ApiKeyData;
  rateLimited?: boolean;
}

// Result of rate limit check
export interface RateLimitResult {
  allowed: boolean;
  usage: number;
  limit: number;
  remaining: number;
  error?: string;
}

/**
 * Validate an API key and check if it's within rate limits
 * @param apiKey - The API key to validate
 * @param limit - Optional custom rate limit (defaults to DEFAULT_RATE_LIMIT)
 * @returns Validation result with key data and rate limit status
 */
export async function validateApiKeyWithRateLimit(
  apiKey: string,
  limit: number = DEFAULT_RATE_LIMIT
): Promise<ValidateApiKeyResult> {
  if (!apiKey) {
    return { valid: false, error: "API key is required" };
  }

  // Check if Supabase is configured
  if (!supabaseAdmin) {
    return { valid: false, error: "Database not configured" };
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("api_keys")
      .select("id, name, key, usage, user_id")
      .eq("key", apiKey)
      .maybeSingle();

    if (error) {
      console.error("Supabase error validating API key:", error);
      return { valid: false, error: `Database error: ${error.message}` };
    }

    if (!data) {
      return { valid: false, error: "Invalid API key" };
    }

    // Check rate limit
    if (data.usage >= limit) {
      return {
        valid: false,
        rateLimited: true,
        error: `Rate limit exceeded. You have used ${data.usage}/${limit} requests. Please upgrade your plan or wait for the limit to reset.`,
        keyData: data,
      };
    }

    return { valid: true, keyData: data };
  } catch (err: unknown) {
    console.error("Error validating API key:", err);
    if (err instanceof Error && err.message.includes("fetch failed")) {
      return {
        valid: false,
        error: "Network error connecting to database. This might be a firewall/proxy issue.",
      };
    }
    return {
      valid: false,
      error: `Validation error: ${err instanceof Error ? err.message : "Unknown error"}`,
    };
  }
}

/**
 * Check rate limit for an API key without validating
 * @param keyId - The API key ID
 * @param limit - Optional custom rate limit
 * @returns Rate limit check result
 */
export async function checkRateLimit(
  keyId: string,
  limit: number = DEFAULT_RATE_LIMIT
): Promise<RateLimitResult> {
  if (!supabaseAdmin) {
    return { allowed: true, usage: 0, limit, remaining: limit }; // Allow if DB not configured
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("api_keys")
      .select("usage")
      .eq("id", keyId)
      .single();

    if (error) {
      console.error("Error checking rate limit:", error);
      return { allowed: true, usage: 0, limit, remaining: limit }; // Allow on error
    }

    const usage = data?.usage || 0;
    const remaining = Math.max(0, limit - usage);
    const allowed = usage < limit;

    return {
      allowed,
      usage,
      limit,
      remaining,
      ...(allowed ? {} : { error: `Rate limit exceeded (${usage}/${limit})` }),
    };
  } catch (err) {
    console.error("Failed to check rate limit:", err);
    return { allowed: true, usage: 0, limit, remaining: limit }; // Allow on error
  }
}

/**
 * Increment API key usage count
 * @param keyId - The API key ID to increment
 * @returns True if successful
 */
export async function incrementUsage(keyId: string): Promise<boolean> {
  if (!supabaseAdmin) {
    return true; // Skip if Supabase not configured
  }

  try {
    // Try RPC first (atomic increment)
    const { error } = await supabaseAdmin.rpc("increment_api_key_usage", {
      key_id: keyId,
    });

    // If RPC doesn't exist, fall back to direct update
    if (error && error.code === "42883") {
      const { data: currentKey } = await supabaseAdmin
        .from("api_keys")
        .select("usage")
        .eq("id", keyId)
        .single();

      if (currentKey) {
        await supabaseAdmin
          .from("api_keys")
          .update({ usage: (currentKey.usage || 0) + 1 })
          .eq("id", keyId);
      }
      return true;
    }

    if (error) {
      console.error("Error incrementing usage:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Failed to increment API key usage:", err);
    return false;
  }
}

/**
 * Reset usage for an API key (e.g., for monthly reset)
 * @param keyId - The API key ID to reset
 * @returns True if successful
 */
export async function resetUsage(keyId: string): Promise<boolean> {
  if (!supabaseAdmin) {
    return true;
  }

  try {
    const { error } = await supabaseAdmin
      .from("api_keys")
      .update({ usage: 0 })
      .eq("id", keyId);

    if (error) {
      console.error("Error resetting usage:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Failed to reset API key usage:", err);
    return false;
  }
}

/**
 * Get usage statistics for an API key
 * @param keyId - The API key ID
 * @param limit - Optional custom rate limit
 * @returns Usage statistics
 */
export async function getUsageStats(
  keyId: string,
  limit: number = DEFAULT_RATE_LIMIT
): Promise<{ usage: number; limit: number; remaining: number; percentUsed: number } | null> {
  if (!supabaseAdmin) {
    return null;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("api_keys")
      .select("usage")
      .eq("id", keyId)
      .single();

    if (error || !data) {
      return null;
    }

    const usage = data.usage || 0;
    return {
      usage,
      limit,
      remaining: Math.max(0, limit - usage),
      percentUsed: Math.round((usage / limit) * 100),
    };
  } catch {
    return null;
  }
}


