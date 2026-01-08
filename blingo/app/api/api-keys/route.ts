import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin, getOrCreateUserByEmail } from "@/lib/supabase-server";

// Helper to generate API key
function generateApiKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const prefix = "blingo-";
  let key = "";
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return prefix + key;
}

// Helper to generate default API key name
function generateDefaultName(): string {
  const now = new Date();
  return `API Key ${now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
}

// Helper to get and validate user email from session and headers
async function getAuthenticatedUserEmail(request: NextRequest): Promise<{ email: string | null; name: string | null; image: string | null; error: string | null }> {
  // Get session from server (primary source of truth)
  const session = await getServerSession(authOptions);
  const sessionEmail = session?.user?.email;
  const sessionName = session?.user?.name || null;
  const sessionImage = session?.user?.image || null;
  
  // Get email from client header (for verification)
  const headerEmail = request.headers.get("X-User-Email");
  
  // Must have a valid session
  if (!sessionEmail) {
    return { email: null, name: null, image: null, error: "Unauthorized - Please sign in" };
  }
  
  // If header email is provided, verify it matches the session
  if (headerEmail && headerEmail !== sessionEmail) {
    console.warn("Email mismatch: header vs session", { headerEmail, sessionEmail });
    return { email: null, name: null, image: null, error: "Unauthorized - Session mismatch" };
  }
  
  return { email: sessionEmail, name: sessionName, image: sessionImage, error: null };
}

// GET /api/api-keys - Get all API keys for the authenticated user
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { email, name, image, error: authError } = await getAuthenticatedUserEmail(request);
    if (authError || !email) {
      return NextResponse.json(
        { error: authError || "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if Supabase is configured
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    // Get or create user in database by email
    const user = await getOrCreateUserByEmail(email, name, image);
    if (!user) {
      console.error("Failed to get or create user for email:", email);
      return NextResponse.json(
        { error: "Failed to get or create user. Please check server logs and ensure Supabase is configured correctly." },
        { status: 500 }
      );
    }

    // Fetch API keys for this user
    const { data, error } = await supabaseAdmin
      .from("api_keys")
      .select("id, name, key, usage, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching API keys:", error);
      return NextResponse.json(
        { error: "Failed to fetch API keys" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("API keys GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/api-keys - Create a new API key for the authenticated user
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { email, name: userName, image, error: authError } = await getAuthenticatedUserEmail(request);
    if (authError || !email) {
      return NextResponse.json(
        { error: authError || "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if Supabase is configured
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    // Get or create user in database by email
    const user = await getOrCreateUserByEmail(email, userName, image);
    if (!user) {
      return NextResponse.json(
        { error: "Failed to get or create user" },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name } = body;

    // Use provided name or generate a default one
    const keyName = (name && typeof name === "string" && name.trim()) 
      ? name.trim() 
      : generateDefaultName();

    // Create new API key
    const newKey = {
      user_id: user.id,
      name: keyName,
      key: generateApiKey(),
      usage: 0,
    };

    const { data, error } = await supabaseAdmin
      .from("api_keys")
      .insert([newKey])
      .select("id, name, key, usage, created_at")
      .single();

    if (error) {
      console.error("Error creating API key:", error);
      return NextResponse.json(
        { error: "Failed to create API key" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    console.error("API keys POST error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
