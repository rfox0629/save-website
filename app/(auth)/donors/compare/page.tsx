import { DonorNav } from "@/components/donors/donor-nav";
import { NonprofitCompare } from "@/components/compare/nonprofit-compare";
import { getDonorComparisonPageData } from "@/lib/compare";

type DonorComparePageProps = {
  searchParams?: {
    left?: string;
    right?: string;
  };
};

export default async function DonorComparePage({
  searchParams,
}: DonorComparePageProps) {
  const data = await getDonorComparisonPageData(
    searchParams?.left,
    searchParams?.right,
  );

  return (
    <main className="min-h-screen bg-[#F9F6F0] px-6 py-10 text-[#1A4480]">
      <div className="mx-auto max-w-6xl space-y-8">
        <DonorNav
          canPreview={data.canPreview}
          currentViewMode={data.currentViewMode}
          email={data.userEmail}
        />
        <section className="rounded-[32px] border border-[#D8D1C3] bg-[linear-gradient(135deg,#FFFDF8_0%,#F4EFE4_100%)] p-8 shadow-[0_25px_80px_rgba(26,68,128,0.08)] md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#7088A5]">
            Donor Comparison
          </p>
          <h1
            className="mt-4 text-4xl leading-tight text-[#1A4480] md:text-5xl"
            style={{ fontFamily: "var(--font-auth-serif)" }}
          >
            Compare Vetted Ministries
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[#4F6357]">
            View two published nonprofits side by side using the same diligence
            summaries and external signals.
          </p>
        </section>

        <NonprofitCompare
          basePath="/donors/compare"
          left={data.left}
          leftValue={data.leftValue}
          options={data.options}
          right={data.right}
          rightValue={data.rightValue}
          theme="light"
        />
      </div>
    </main>
  );
}
