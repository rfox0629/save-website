import Link from "next/link";

import { NonprofitCompare } from "@/components/compare/nonprofit-compare";
import { getReviewerComparisonPageData } from "@/lib/compare";

type ReviewerComparePageProps = {
  searchParams?: {
    left?: string;
    right?: string;
  };
};

export default async function ReviewerComparePage({
  searchParams,
}: ReviewerComparePageProps) {
  const data = await getReviewerComparisonPageData(
    searchParams?.left,
    searchParams?.right,
  );

  return (
    <main className="min-h-screen bg-[#0B1622] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <Link
            className="text-sm text-[#C09A45] hover:text-[#F4E3B2]"
            href="/dashboard"
          >
            Back to dashboard
          </Link>
          <h1 className="mt-3 text-3xl font-semibold">
            Compare Nonprofits
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">
            Review two nonprofit applications side by side using the existing AI
            summary and external review data.
          </p>
        </div>

        <NonprofitCompare
          basePath="/applications/compare"
          left={data.left}
          leftValue={data.leftValue}
          options={data.options}
          right={data.right}
          rightValue={data.rightValue}
        />
      </div>
    </main>
  );
}
