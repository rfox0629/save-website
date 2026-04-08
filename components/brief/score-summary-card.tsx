type ScoreSummary = {
  doctrine: number;
  external: number;
  financial: number;
  fruit: number;
  governance: number;
  leadership: number;
  max: number;
  total: number;
};

function getBandLabel(score: number) {
  if (score >= 80) {
    return "High confidence";
  }

  if (score >= 65) {
    return "Moderate confidence";
  }

  if (score > 0) {
    return "Needs caution";
  }

  return "Not scored";
}

function getBandClass(score: number, variant: "dark" | "light") {
  if (variant === "dark") {
    if (score >= 80) {
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
    }

    if (score >= 65) {
      return "border-amber-400/20 bg-amber-400/10 text-amber-200";
    }

    return "border-rose-400/20 bg-rose-400/10 text-rose-200";
  }

  if (score >= 80) {
    return "border-emerald-200 bg-emerald-50 text-emerald-900";
  }

  if (score >= 65) {
    return "border-amber-200 bg-amber-50 text-amber-900";
  }

  return "border-rose-200 bg-rose-50 text-rose-900";
}

export function ScoreSummaryCard({
  recommendation,
  scoreSummary,
  variant = "dark",
}: {
  recommendation: string;
  scoreSummary: ScoreSummary;
  variant?: "dark" | "light";
}) {
  const isLight = variant === "light";
  const shellClass = isLight
    ? "border-[#E3DCCF] bg-white text-[#23372B]"
    : "border-white/10 bg-white/[0.03] text-white";
  const mutedTextClass = isLight ? "text-[#617367]" : "text-slate-300";
  const sectionLabelClass = isLight
    ? "text-[#6B8570]"
    : "text-[#C09A45]";
  const cardClass = isLight
    ? "border-[#E3DCCF] bg-[#FCFAF5]"
    : "border-white/10 bg-[#0B1622]/70";

  return (
    <section className={`rounded-[2rem] border p-6 ${shellClass}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p
            className={`text-xs font-semibold uppercase tracking-[0.3em] ${sectionLabelClass}`}
          >
            Score Summary
          </p>
          <h3 className="mt-3 text-2xl font-semibold">
            {scoreSummary.total > 0 ? `${scoreSummary.total}/${scoreSummary.max}` : "Pending"}
          </h3>
          <p className={`mt-2 text-sm ${mutedTextClass}`}>
            Overall Assessment: {getBandLabel(scoreSummary.total)}
          </p>
        </div>
        <div
          className={`rounded-full border px-4 py-2 text-sm font-semibold ${getBandClass(
            scoreSummary.total,
            variant,
          )}`}
        >
          {recommendation}
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {[
          ["Leadership", scoreSummary.leadership, 20],
          ["Doctrine", scoreSummary.doctrine, 15],
          ["Governance", scoreSummary.governance, 15],
          ["Financial", scoreSummary.financial, 20],
          ["Fruit", scoreSummary.fruit, 20],
          ["External", scoreSummary.external, 10],
        ].map(([label, score, max]) => (
          <div className={`rounded-[1.5rem] border p-4 ${cardClass}`} key={label}>
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">{label}</p>
              <p className={`text-sm ${mutedTextClass}`}>
                {score}/{max}
              </p>
            </div>
            <div
              className={`mt-3 h-2 overflow-hidden rounded-full ${
                isLight ? "bg-[#E8E0D3]" : "bg-white/10"
              }`}
            >
              <div
                className={isLight ? "h-full rounded-full bg-[#1B4D35]" : "h-full rounded-full bg-[#C09A45]"}
                style={{ width: `${Math.max(0, Math.min(100, (Number(score) / Number(max)) * 100))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
