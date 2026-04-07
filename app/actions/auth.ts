"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const magicLinkSchema = z.object({
  email: z.string().email("Enter a valid email address."),
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
}): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(values);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function sendMagicLink(values: {
  email: string;
}): Promise<AuthActionResult> {
  const parsed = magicLinkSchema.safeParse(values);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${getBaseUrl()}/auth/confirm?next=/dashboard`,
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

  if (data.session) {
    redirect("/dashboard");
  }

  redirect("/login?message=check-email");
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();

  redirect("/login");
}
