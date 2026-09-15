import Link from "next/link";

import { VoiceAlignmentManager } from "@/components/dashboard/voice-alignment-manager";
import { getApplicationDetail } from "@/lib/review";
import { getRequestBaseUrl } from "@/lib/voice-alignment";

/**
 * Voice alignment invitation manager, preserved on its own route.
 *
 * This is the working legacy manager (reference invitations, responses,
 * synthesis) kept fully functional while the reviewer workspace moves to the
 * approved design. Its full restyle onto the design system is tracked in
 * Phase B Stage 4 alongside Time With Leadership. Access is gated by
 * getApplicationDetail (admin/reviewer only).
 */
export default async function VoiceAlignmentPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await getApplicationDetail(params.id);

  return (
    <main className="min-h-screen bg-[#0B1622] px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link
          className="text-sm text-slate-300 underline underline-offset-4 hover:text-white"
          href={`/applications/${params.id}`}
        >
          ← Back to {data.organization.legal_name}
        </Link>
        <VoiceAlignmentManager
          applicationId={params.id}
          baseUrl={getRequestBaseUrl()}
          organizationName={data.organization.legal_name}
          summary={data.voiceAlignment}
        />
      </div>
    </main>
  );
}
