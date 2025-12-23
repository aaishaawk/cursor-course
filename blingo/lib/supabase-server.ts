import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if Supabase is configured
const isSupabaseConfigured = supabaseUrl && supabaseServiceRoleKey;

export const supabaseAdmin = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// User type for database
export interface UserRow {
  id: string;
  google_id: string;
  email: string;
  name: string | null;
  image: string | null;
  created_at: string;
  updated_at: string;
}

// Function to upsert user on login
export async function upsertUser(userData: {
  google_id: string;
  email: string;
  name?: string | null;
  image?: string | null;
}): Promise<UserRow | null> {
  if (!supabaseAdmin) {
    console.warn("Supabase not configured - skipping user upsert");
    return null;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .upsert(
        {
          google_id: userData.google_id,
          email: userData.email,
          name: userData.name,
          image: userData.image,
        },
        {
          onConflict: "google_id",
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Error upserting user:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Failed to connect to Supabase:", err);
    return null;
  }
}

// Function to get user by Google ID
export async function getUserByGoogleId(
  googleId: string
): Promise<UserRow | null> {
  if (!supabaseAdmin) {
    console.warn("Supabase not configured");
    return null;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("google_id", googleId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return null;
      }
      console.error("Error fetching user:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Failed to connect to Supabase:", err);
    return null;
  }
}

// Function to get user by email
export async function getUserByEmail(email: string): Promise<UserRow | null> {
  if (!supabaseAdmin) {
    console.warn("Supabase not configured");
    return null;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("Error fetching user:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Failed to connect to Supabase:", err);
    return null;
  }
}

