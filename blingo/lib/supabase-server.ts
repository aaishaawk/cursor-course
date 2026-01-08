import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

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
    // First check if user exists by google_id
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("google_id", userData.google_id)
      .maybeSingle();

    if (existingUser) {
      // Update existing user
      const { data, error } = await supabaseAdmin
        .from("users")
        .update({
          email: userData.email,
          name: userData.name,
          image: userData.image,
        })
        .eq("google_id", userData.google_id)
        .select()
        .single();

      if (error) {
        console.error("Error updating user:", error);
        return existingUser; // Return existing user even if update fails
      }
      return data;
    }

    // Create new user with generated UUID
    const { data, error } = await supabaseAdmin
      .from("users")
      .insert({
        id: randomUUID(),
        google_id: userData.google_id,
        email: userData.email,
        name: userData.name || userData.email.split("@")[0],
        image: userData.image,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating user:", error);
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

// Function to get or create user by email (auto-provision)
export async function getOrCreateUserByEmail(
  email: string,
  name?: string | null,
  image?: string | null
): Promise<UserRow | null> {
  if (!supabaseAdmin) {
    console.error("Supabase admin client not configured - check SUPABASE_SERVICE_ROLE_KEY");
    return null;
  }

  try {
    // First try to get existing user by email
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching user by email:", fetchError);
      // Continue to try creating the user
    }

    if (existingUser) {
      return existingUser;
    }

    // User doesn't exist, create them
    // Generate a unique google_id placeholder based on email
    // Using a timestamp to ensure uniqueness
    const timestamp = Date.now();
    const emailHash = email.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10);
    const placeholderGoogleId = `auto_${emailHash}_${timestamp}`;

    console.log("Creating new user with email:", email);

    // Build insert object - generate UUID since Supabase default might not work
    const insertData: Record<string, string> = {
      id: randomUUID(), // Generate UUID since database default isn't working
      google_id: placeholderGoogleId,
      email: email,
      name: name || email.split("@")[0],
    };
    
    // Only add image if provided
    if (image) {
      insertData.image = image;
    }

    const { data: newUser, error: insertError } = await supabaseAdmin
      .from("users")
      .insert(insertData)
      .select("id, google_id, email, name, image, created_at, updated_at")
      .single();

    if (insertError) {
      console.error("Error creating user:", insertError);
      
      // If insert failed due to email conflict (race condition), try to fetch again
      if (insertError.code === "23505") {
        console.log("User was created by another request, fetching...");
        const { data: raceUser } = await supabaseAdmin
          .from("users")
          .select("*")
          .eq("email", email)
          .single();
        return raceUser;
      }
      
      return null;
    }

    console.log("Successfully created user:", newUser.id);
    return newUser;
  } catch (err) {
    console.error("Failed to get or create user:", err);
    return null;
  }
}

