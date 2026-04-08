import {
  getBriefRationale,
  type RecommendationLevel,
} from "@/lib/brief-shared";
import type {
  Applications,
  DonorBrief,
  Organizations,
} from "@/lib/supabase/types";

const PUBLIC_DILIGENCE_ITEMS = [
  "IRS TEOS Verification",
  "Form 990 Review",
  "Leadership Assessment",
  "Governance Review",
  "Doctrinal Review",
  "Financial Review",
  "Reference Checks",
  "Reputation Search",
] as const;

function SaveMark() {
  return (
    <div className="inline-flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B4D35] text-sm font-bold tracking-[0.22em] text-[#F9F6F0]">
        S
      </div>
      <div>
        <div className="text-sm font-semibold uppercase tracking-[0.3em] text-[#1B4D35]">
          SAVE
        </div>
        <div className="text-xs text-[#6B8570]">Ministry Vetting</div>
      </div>
    </div>
  );
}

function getRecommendationBadge(level: string | null) {
  if (level === "Strongly Recommended") {
    return "bg-[#EAF5EE] text-[#1B4D35]";
  }

  if (level === "Recommended") {
    return "bg-[#EDF6EF] text-[#2F7A53]";
  }

  if (level === "Recommended with Conditions") {
    return "bg-[#FFF4DA] text-[#8A6720]";
  }

  return "bg-[#F1ECE1] text-[#4F6357]";
}

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#EAF5EE] text-xs font-bold text-[#1B4D35]">
        ✓
      </span>
      <span>{children}</span>
    </li>
  );
}

export function PublicDonorBrief({
  application,
  brief,
  org,
  titleClassName,
}: {
  application: Applications;
  brief: DonorBrief;
  org: Organizations;
  titleClassName?: string;
}) {
  const commendations = brief.commendations.filter((item) => item.trim());
  const cautions = brief.cautions.filter((item) => item.trim());
  const reviewedDate = new Date(
    brief.published_at ?? brief.generated_at,
  ).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const metadata = [
    org.ein ? `EIN ${org.ein}` : null,
    org.year_founded ? `Founded ${org.year_founded}` : null,
    org.state_of_incorporation ?? null,
    org.entity_type ?? null,
  ].filter(Boolean);
  const geographicScope =
    org.geographic_scope.length > 0
      ? org.geographic_scope.join(", ")
      : "Geographic scope not provided";
  const rationale =
    brief.rationale ??
    getBriefRationale(
      brief.recommendation_level as RecommendationLevel | string | null,
      cautions,
    );

  return (
    <article className="mx-auto w-full max-w-4xl rounded-[32px] border border-[#E3DCCF] bg-white px-6 py-8 text-[#23372B] shadow-[0_20px_60px_rgba(27,77,53,0.06)] md:px-10 md:py-10 print:max-w-none print:break-after-page print:rounded-none print:border-0 print:px-0 print:py-0 print:shadow-none">
      <header className="border-b border-[#E8E0D2] pb-8 print:break-inside-avoid-page">
        <div className="flex items-start justify-between gap-6">
          <SaveMark />
          <span
            className={`inline-flex rounded-full border border-[#D8D1C3] px-4 py-2 text-sm font-semibold ${getRecommendationBadge(
              brief.recommendation_level,
            )}`}
          >
            {brief.recommendation_level ?? "Recommendation pending"}
          </span>
        </div>

        <div className="mt-8 space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#6B8570]">
            Public Donor Brief
          </p>
          <h1 className={`${titleClassName ?? ""} text-[32px] text-[#1B4D35]`}>
            {org.legal_name}
          </h1>
          {metadata.length > 0 ? (
            <p className="text-sm text-[#617367]">{metadata.join(" · ")}</p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {org.primary_focus.map((focus) => (
              <span
                className="rounded-full bg-[#FFF4DA] px-3 py-1 text-xs font-semibold text-[#8A6720]"
                key={focus}
              >
                {focus}
              </span>
            ))}
          </div>

          <p className="text-sm font-medium text-[#4F6357]">
            {geographicScope}
          </p>
        </div>
      </header>

      <div className="space-y-10 py-10 print:space-y-8">
        <section className="print:break-inside-avoid-page">
          <h2 className="text-xl font-semibold text-[#1B4D35]">
            About this Ministry
          </h2>
          <p className="mt-4 text-[15px] leading-8 text-[#475A4F]">
            {brief.ministry_description ||
              "No ministry summary has been published yet."}
          </p>
        </section>

        <section className="print:break-inside-avoid-page">
          <h2 className="text-xl font-semibold text-[#1B4D35]">
            What We Found Commendable
          </h2>
          <ul className="mt-4 space-y-3 text-[15px] leading-8 text-[#475A4F]">
            {commendations.map((item, index) => (
              <CheckItem key={`${item}-${index}`}>{item}</CheckItem>
            ))}
          </ul>
        </section>

        {cautions.length > 0 ? (
          <section className="print:break-inside-avoid-page">
            <h2 className="text-xl font-semibold text-[#1B4D35]">
              Areas for Donor Awareness
            </h2>
            <div className="mt-4 border-l-4 border-[#C09A45] bg-[#FFF8E8] px-5 py-4">
              <ul className="space-y-3 text-[15px] leading-8 text-[#6C5A2F]">
                {cautions.map((item, index) => (
                  <li className="ml-5 list-disc pl-1" key={`${item}-${index}`}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        {application.immersive_discernment_status === "completed" &&
        application.immersive_discernment_notes ? (
          <section className="print:break-inside-avoid-page">
            <h2 className="text-xl font-semibold text-[#1B4D35]">
              On the Ground Discernment
            </h2>
            <div className="mt-4 rounded-[24px] bg-[#EAF5EE] px-5 py-4 text-[15px] leading-8 text-[#365342]">
              {application.immersive_discernment_notes}
            </div>
          </section>
        ) : null}

        <section className="print:break-inside-avoid-page">
          <h2 className="text-xl font-semibold text-[#1B4D35]">
            Diligence Completed
          </h2>
          <ul className="mt-4 grid gap-4 text-[15px] leading-7 text-[#475A4F] md:grid-cols-2">
            {PUBLIC_DILIGENCE_ITEMS.map((item) => (
              <CheckItem key={item}>{item}</CheckItem>
            ))}
          </ul>
        </section>

        <section className="print:break-inside-avoid-page">
          <h2 className="text-xl font-semibold text-[#1B4D35]">
            Recommendation
          </h2>
          <div className="mt-4 space-y-4 rounded-[28px] bg-[#F4EFE4] px-6 py-6">
            <p className="text-3xl text-[#1B4D35]">
              {brief.recommendation_level}
            </p>
            <p className="text-[15px] leading-8 text-[#475A4F]">{rationale}</p>
            <p className="text-sm text-[#6B8570]">
              Reviewed {reviewedDate} by SAVE Vetting Team
            </p>
          </div>
        </section>
      </div>

      <footer className="border-t border-[#E8E0D2] pt-6 text-sm leading-7 text-[#6B8570] print:break-inside-avoid-page">
        This brief is for informational purposes only. SAVE does not guarantee
        outcomes. Donors are encouraged to conduct their own additional due
        diligence.
      </footer>
    </article>
  );
}
