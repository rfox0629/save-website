"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { z } from "zod";

import { getPathForRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  redirectTo: z.string().optional(),
});

const magicLinkSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  redirectTo: z.string().optional(),
});

const registerSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  organizationLegalName: z
    .string()
    .min(2, "Organization legal name is required."),
  ein: z
    .string()
    .min(1, "EIN is required.")
    .regex(/^\d{2}-?\d{7}$/, "Enter a valid EIN."),
});

type AuthActionResult = {
  error?: string;
};

async function getRoleRedirect(userId: string) {
  const supabase = createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  return getPathForRole((profile as Pick<Profile, "role"> | null)?.role);
}

function getBaseUrl() {
  const headerList = headers();
  const origin = headerList.get("origin");

  if (origin) {
    return origin;
  }

  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");

  if (host) {
    return `${protocol}://${host}`;
  }

  return "http://localhost:3000";
}

function getServiceRoleClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

export async function login(values: {
  email: string;
  password: string;
  redirectTo?: string;
}): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(values);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: error.message };
  }

  const userId = data.user?.id;
  const destination =
    parsed.data.redirectTo ||
    (userId ? await getRoleRedirect(userId) : "/portal");

  redirect(destination);
}

export async function sendMagicLink(values: {
  email: string;
  redirectTo?: string;
}): Promise<AuthActionResult> {
  const parsed = magicLinkSchema.safeParse(values);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const supabase = createClient();
  const nextPath = parsed.data.redirectTo || "/auth/confirm";
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${getBaseUrl()}/auth/confirm?next=${encodeURIComponent(
        nextPath,
      )}`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return {};
}

export async function register(values: {
  email: string;
  password: string;
  organizationLegalName: string;
  ein: string;
}): Promise<AuthActionResult> {
  const parsed = registerSchema.safeParse(values);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  const userId = data.user?.id;

  if (!userId) {
    return { error: "We could not create your account. Please try again." };
  }

  const admin = getServiceRoleClient();
  const normalizedEin = parsed.data.ein.replace(/\D/g, "");
  const formattedEin = `${normalizedEin.slice(0, 2)}-${normalizedEin.slice(2)}`;

  const { data: organization, error: organizationError } = await admin
    .from("organizations")
    .insert({
      ein: formattedEin,
      legal_name: parsed.data.organizationLegalName,
      status: "inquiry_submitted",
    })
    .select("id")
    .single();

  if (organizationError || !organization) {
    return {
      error:
        organizationError?.message ??
        "We could not create your organization record.",
    };
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: userId,
    organization_id: organization.id,
    role: "ministry",
  });

  if (profileError) {
    return { error: profileError.message };
  }

  const { error: applicationError } = await admin.from("applications").insert({
    organization_id: organization.id,
    status: "inquiry_submitted",
  });

  if (applicationError) {
    return { error: applicationError.message };
  }

  if (data.session) {
    redirect("/portal?welcome=1");
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (!signInError) {
    redirect("/portal?welcome=1");
  }

  redirect("/login?message=check-email&redirectTo=%2Fportal");
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();

  redirect("/login");
}
