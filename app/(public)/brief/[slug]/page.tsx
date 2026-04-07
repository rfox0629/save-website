import { notFound } from "next/navigation";

import { BriefPreview } from "@/components/brief/brief-preview";
import { PrintButton } from "@/components/brief/print-button";
import { getPublishedBriefBySlug } from "@/lib/brief";
import { toBriefFormData } from "@/lib/brief-shared";

type PublicBriefPageProps = {
  params: {
    slug: string;
  };
};

export default async function PublicBriefPage({
  params,
}: PublicBriefPageProps) {
  const data = await getPublishedBriefBySlug(params.slug);

  if (!data) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f4efe4] px-4 py-8 text-slate-900 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto flex max-w-[980px] justify-end pb-4 print:hidden">
        <PrintButton />
      </div>
      <BriefPreview
        brief={{
          ...toBriefFormData(data.brief),
          generated_at: data.brief.generated_at,
          headline: data.brief.headline ?? data.org.legal_name,
        }}
        org={data.org}
        publicView
      />
    </main>
  );
}
