import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin, getOrCreateUserByEmail } from "@/lib/supabase-server";

interface RouteParams {
  params: Promise<{ id: string }>;
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

// GET /api/api-keys/[id] - Get a specific API key for the authenticated user
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

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
      return NextResponse.json(
        { error: "Failed to get or create user" },
        { status: 500 }
      );
    }

    // Fetch the specific API key for this user
    const { data, error } = await supabaseAdmin
      .from("api_keys")
      .select("id, name, key, usage, created_at")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "API key not found" },
          { status: 404 }
        );
      }
      console.error("Error fetching API key:", error);
      return NextResponse.json(
        { error: "Failed to fetch API key" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("API key GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/api-keys/[id] - Update a specific API key for the authenticated user
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

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

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // First, verify the API key belongs to this user
    const { data: existingKey, error: fetchError } = await supabaseAdmin
      .from("api_keys")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !existingKey) {
      return NextResponse.json(
        { error: "API key not found" },
        { status: 404 }
      );
    }

    // Update the API key
    const { data, error } = await supabaseAdmin
      .from("api_keys")
      .update({ name: name.trim() })
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id, name, key, usage, created_at")
      .single();

    if (error) {
      console.error("Error updating API key:", error);
      return NextResponse.json(
        { error: "Failed to update API key" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("API key PUT error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/api-keys/[id] - Delete a specific API key for the authenticated user
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

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
      return NextResponse.json(
        { error: "Failed to get or create user" },
        { status: 500 }
      );
    }

    // First, verify the API key belongs to this user
    const { data: existingKey, error: fetchError } = await supabaseAdmin
      .from("api_keys")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !existingKey) {
      return NextResponse.json(
        { error: "API key not found" },
        { status: 404 }
      );
    }

    // Delete the API key
    const { error } = await supabaseAdmin
      .from("api_keys")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting API key:", error);
      return NextResponse.json(
        { error: "Failed to delete API key" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "API key deleted successfully" });
  } catch (err) {
    console.error("API key DELETE error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
