import { Lora } from "next/font/google";
import { notFound } from "next/navigation";

import { PublicDonorBrief } from "@/components/brief/public-donor-brief";
import { PrintButton } from "@/components/brief/print-button";
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

      <PublicDonorBrief
        application={data.application}
        brief={data.brief}
        org={data.org}
        titleClassName={lora.className}
      />
    </main>
  );
}
