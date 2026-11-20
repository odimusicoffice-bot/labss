import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SUPER_ADMIN_EMAIL = "odimusic.office@gmail.com";

interface AdminUser {
  id: string;
  name: string;
  email: string | null;
  role: string;
  created_at: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify the caller is an admin by checking their JWT against the anon client
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonError("Missing authorization header.", 401);
    }

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller }, error: callerError } = await callerClient.auth.getUser();
    if (callerError || !caller) {
      return jsonError("Unauthorized.", 401);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Fetch the caller's profile to check admin role
    const { data: callerProfile } = await adminClient
      .from("profiles")
      .select("role, email")
      .eq("id", caller.id)
      .single();

    const isSuperAdmin = callerProfile?.email === SUPER_ADMIN_EMAIL || caller.email === SUPER_ADMIN_EMAIL;
    const isAdminRole = callerProfile?.role === "admin";
    if (!isSuperAdmin && !isAdminRole) {
      return jsonError("Forbidden. Admin access required.", 403);
    }

    // Service-role client for privileged operations
    const serviceClient = createClient(supabaseUrl, serviceRoleKey);

    if (req.method === "GET") {
      const { data, error } = await serviceClient
        .from("profiles")
        .select("id, username, email, role, created_at")
        .order("created_at", { ascending: true });

      if (error) {
        return jsonError("Failed to load users.", 500);
      }

      const users: AdminUser[] = (data ?? []).map((row: Record<string, unknown>) => ({
        id: row.id as string,
        name: (row.username as string) ?? "",
        email: (row.email as string) ?? null,
        role: (row.role as string) ?? "member",
        created_at: row.created_at as string,
      }));

      return jsonResponse({ users });
    }

    if (req.method === "PUT") {
      const { userId, role } = await req.json();
      if (!userId || !role) {
        return jsonError("Missing userId or role.", 400);
      }

      // Prevent changing super admin's role
      const { data: target } = await serviceClient
        .from("profiles")
        .select("email")
        .eq("id", userId)
        .single();
      if (target?.email === SUPER_ADMIN_EMAIL) {
        return jsonError("Cannot change Super Admin role.", 403);
      }

      const { error } = await serviceClient
        .from("profiles")
        .update({ role })
        .eq("id", userId);

      if (error) {
        return jsonError("Failed to update role.", 500);
      }
      return jsonResponse({ success: true });
    }

    if (req.method === "DELETE") {
      const { userId } = await req.json();
      if (!userId) {
        return jsonError("Missing userId.", 400);
      }

      const { data: target } = await serviceClient
        .from("profiles")
        .select("email")
        .eq("id", userId)
        .single();
      if (target?.email === SUPER_ADMIN_EMAIL) {
        return jsonError("Cannot delete Super Admin.", 403);
      }

      const { error } = await serviceClient.auth.admin.deleteUser(userId);
      if (error) {
        return jsonError("Failed to delete user.", 500);
      }
      return jsonResponse({ success: true });
    }

    if (req.method === "POST") {
      const { userId } = await req.json();
      if (!userId) {
        return jsonError("Missing userId.", 400);
      }

      const { data: target } = await serviceClient
        .from("profiles")
        .select("email")
        .eq("id", userId)
        .single();
      if (target?.email === SUPER_ADMIN_EMAIL) {
        return jsonError("Cannot reset Super Admin password.", 403);
      }

      const email = target?.email;
      if (!email) {
        return jsonError("User has no email.", 400);
      }

      const tempPassword = generateTempPassword();
      const { error } = await serviceClient.auth.admin.updateUserById(userId, {
        password: tempPassword,
      });

      if (error) {
        return jsonError("Failed to reset password.", 500);
      }
      return jsonResponse({ email, tempPassword });
    }

    return jsonError("Method not allowed.", 405);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error.";
    return jsonError(message, 500);
  }
});

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
  let result = "";
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < 12; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}
