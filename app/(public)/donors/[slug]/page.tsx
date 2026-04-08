import { Lora } from "next/font/google";
import { notFound } from "next/navigation";

import { PublicAiSummary } from "@/components/brief/public-ai-summary";
import { PublicDonorBrief } from "@/components/brief/public-donor-brief";
import { PrintButton } from "@/components/brief/print-button";
import { ScoreSummaryCard } from "@/components/brief/score-summary-card";
import { getPublishedBriefBySlug } from "@/lib/brief";

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

type PublicDonorBriefPageProps = {
  params: {
    slug: string;
  };
};

export default async function PublicDonorBriefPage({
  params,
}: PublicDonorBriefPageProps) {
  const data = await getPublishedBriefBySlug(params.slug);

  if (!data) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#F9F6F0] px-4 py-8 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto mb-4 flex max-w-4xl justify-end print:hidden">
        <PrintButton label="Print brief" />
      </div>

      {data.isStale ? (
        <div className="mx-auto mb-4 max-w-4xl rounded-[24px] border border-amber-200 bg-[#FFF7E8] px-5 py-4 text-[#7A5A1F]">
          <p className="text-sm leading-7">
            This brief may not reflect the most recent updates.
          </p>
        </div>
      ) : null}

      <PublicDonorBrief
        application={data.application}
        brief={data.brief}
        org={data.org}
        titleClassName={lora.className}
      />
      <div className="mx-auto mt-8 w-full max-w-4xl">
        <ScoreSummaryCard
          recommendation={data.brief.recommendation_level ?? data.scoreRecommendation}
          scoreSummary={data.scoreSummary}
          variant="light"
        />
      </div>
      <PublicAiSummary
        application={data.application}
        externalChecks={data.externalChecks}
        org={data.org}
      />
    </main>
  );
}
