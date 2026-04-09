import { notFound } from "next/navigation";

import { VoiceAlignmentResponseForm } from "@/components/forms/voice-alignment-response-form";
import { getVoiceAlignmentInviteByToken } from "@/lib/voice-alignment";

type VoiceAlignmentPublicPageProps = {
  params: {
    token: string;
  };
};

export default async function VoiceAlignmentPublicPage({
  params,
}: VoiceAlignmentPublicPageProps) {
  const invite = await getVoiceAlignmentInviteByToken(params.token);

  if (!invite?.request || !invite.organization || !invite.application) {
    notFound();
  }

  if (invite.response || invite.request.status === "responded") {
    return (
      <main className="min-h-screen bg-[#F9F6F0] px-6 py-10">
        <div className="mx-auto max-w-3xl space-y-8">
          <section className="rounded-[32px] border border-[#B7D7C4] bg-[#EAF5EE] px-8 py-10">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#6B8570]">
              Voice Alignment
            </p>
            <h1
              className="mt-4 text-4xl leading-tight text-[#1B4D35]"
              style={{ fontFamily: "var(--font-public-serif)" }}
            >
              Perspective already shared
            </h1>
            <p className="mt-4 text-base leading-8 text-[#365342]">
              This invite link has already been completed. Thank you for taking
              the time to share your perspective.
            </p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F9F6F0] px-6 py-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <section className="rounded-[32px] border border-[#D8D1C3] bg-[linear-gradient(135deg,#FFFDF8_0%,#F4EFE4_100%)] p-8 shadow-[0_25px_80px_rgba(27,77,53,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#6B8570]">
            Voice Alignment
          </p>
          <h1
            className="mt-4 text-4xl leading-tight text-[#1B4D35]"
            style={{ fontFamily: "var(--font-public-serif)" }}
          >
            Share Your Perspective
          </h1>
          <p className="mt-4 text-base leading-8 text-[#4F6357]">
            Your input helps us understand how {invite.organization.legal_name} is
            experienced both internally and externally.
          </p>
          <p className="mt-3 text-sm leading-7 text-[#6B8570]">
            This is a private, relational process intended to surface patterns
            with care and clarity.
          </p>
        </section>

        <VoiceAlignmentResponseForm
          requestType={invite.request.request_type}
          respondentEmail={invite.request.respondent_email}
          respondentName={invite.request.respondent_name}
          token={params.token}
        />
      </div>
    </main>
  );
}
