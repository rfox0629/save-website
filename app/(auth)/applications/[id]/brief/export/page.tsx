import { Lora } from "next/font/google";

import { AutoPrint } from "@/components/brief/auto-print";
import { SaveBriefV1 } from "@/components/brief/save-brief-v1";
import { getBriefExportData } from "@/lib/brief";

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

type BriefExportPageProps = {
  params: {
    id: string;
  };
};

export default async function BriefExportPage({
  params,
}: BriefExportPageProps) {
  const data = await getBriefExportData(params.id);

  return (
    <main className="min-h-screen bg-[#F9F6F0] px-4 py-8 print:min-h-0 print:bg-white print:px-0 print:py-0">
      <AutoPrint />
      <div className="mx-auto mb-4 max-w-4xl rounded-2xl border border-[#E3DCCF] bg-white px-5 py-4 text-sm text-[#4F6357] print:hidden">
        Print dialog opened automatically. Choose <span className="font-semibold">Save as PDF</span> to export this donor brief.
      </div>
      <div className="mx-auto mb-6 hidden max-w-4xl print:block">
        <div className="border-b border-[#E8E0D2] pb-4 text-center text-sm tracking-[0.18em] text-[#7088A5]">
          SAVE DONOR BRIEF
        </div>
      </div>
      {data.isStale ? (
        <div className="mx-auto mb-4 max-w-4xl rounded-2xl border border-amber-200 bg-[#FFF7E8] px-5 py-4 text-sm text-[#7A5A1F] print:break-inside-avoid-page">
          Note: This brief may not reflect the most recent updates.
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
