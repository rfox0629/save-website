import "server-only";

import { revalidatePath } from "next/cache";

import { requireReviewerMutationAccess } from "@/lib/review";
import { assertDisplayName } from "@/lib/staff-profile-shared";
import { createAdminClient } from "@/lib/supabase/admin";

export * from "@/lib/staff-profile-shared";

/**
 * A staff member sets their own display name.
 *
 * Attribution reads `profiles.display_name`, and a staff profile without one
 * records snapshots naming only an email — fine while the person is here,
 * permanent once they leave. Provisioning now requires a name, but accounts
 * created before that constraint still have none, and fixing those should not
 * need a database administrator.
 *
 * Only the signed-in staff member's own row is writable here: a display name is
 * how colleagues recognise someone's work, not something to be set for them.
 */
export async function setOwnDisplayName(value: unknown) {
  const { user } = await requireReviewerMutationAccess();
  const displayName = assertDisplayName(value);

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ display_name: displayName })
    .eq("id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
}
