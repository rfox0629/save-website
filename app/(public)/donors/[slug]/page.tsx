import { Lora } from "next/font/google";
import { notFound } from "next/navigation";

import { PrintButton } from "@/components/brief/print-button";
import { SaveBriefV1 } from "@/components/brief/save-brief-v1";
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

      <SaveBriefV1
        application={data.application}
        brief={data.brief}
        externalChecks={data.externalChecks}
        org={data.org}
        titleClassName={lora.className}
        voiceAlignment={data.voiceAlignment}
      />
    </main>
  );
}
