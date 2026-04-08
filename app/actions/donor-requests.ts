"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminPageAccess } from "@/lib/review";
import type { DonorRequest } from "@/lib/supabase/types";

const donorRequestSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  fullName: z.string().min(2, "Full name is required."),
  givingFocus: z
    .string()
    .min(10, "Please share a brief description of your giving focus.")
    .max(300, "Keep this to 300 characters or fewer."),
  organization: z.string().max(120).optional(),
  referralSource: z.enum([
    "Ministry referral",
    "Peer referral",
    "Conference",
    "Other",
  ]),
});

type ActionResult = {
  error?: string;
  success?: boolean;
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

  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function submitDonorAccessRequest(values: {
  email: string;
  fullName: string;
  givingFocus: string;
  organization?: string;
  referralSource:
    | "Ministry referral"
    | "Peer referral"
    | "Conference"
    | "Other";
}): Promise<ActionResult> {
  const parsed = donorRequestSchema.safeParse(values);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const admin = createAdminClient();
  // The generated schema is ahead of the local client types for this new table.
  // Cast narrowly here so we can use the table before the next type refresh.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;
  const { error } = await db.from("donor_requests").insert({
    email: parsed.data.email,
    full_name: parsed.data.fullName,
    giving_focus: parsed.data.givingFocus,
    organization: parsed.data.organization?.trim() || null,
    referral_source: parsed.data.referralSource,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function getDonorRequests() {
  await requireAdminPageAccess();

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;
  const { data } = await db
    .from("donor_requests")
    .select("*")
    .order("created_at", { ascending: false });

  return (data ?? []) as DonorRequest[];
}

export async function approveDonorRequest(id: string): Promise<ActionResult> {
  await requireAdminPageAccess();

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;
  const { data: request } = await db
    .from("donor_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  const donorRequest = request as DonorRequest | null;

  if (!donorRequest) {
    return { error: "Request not found." };
  }

  if (donorRequest.status === "approved") {
    return { success: true };
  }

  const invite = await admin.auth.admin.inviteUserByEmail(donorRequest.email, {
    redirectTo: `${getBaseUrl()}/auth/confirm`,
    data: {
      full_name: donorRequest.full_name,
      role: "donor",
    },
  });

  if (invite.error || !invite.data.user) {
    return { error: invite.error?.message ?? "Unable to send donor invite." };
  }

  const { error: profileError } = await db.from("profiles").upsert({
    id: invite.data.user.id,
    organization_id: null,
    role: "donor",
  });

  if (profileError) {
    return { error: profileError.message };
  }

  const { error: updateError } = await db
    .from("donor_requests")
    .update({ status: "approved" })
    .eq("id", id);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath("/admin/donor-requests");
  return { success: true };
}

export async function declineDonorRequest(id: string): Promise<ActionResult> {
  await requireAdminPageAccess();

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;
  const { error } = await db
    .from("donor_requests")
    .update({ status: "declined" })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/donor-requests");
  return { success: true };
}
