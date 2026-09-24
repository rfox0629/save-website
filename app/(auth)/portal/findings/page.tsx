import Link from "next/link";

import { MinistryNav } from "@/components/portal/ministry-nav";
import { getMinistryFindings } from "@/lib/ministry-findings";
import { requireMinistryContext } from "@/lib/ministry";

export const metadata = { title: "Findings" };

function formatDate(value: string | null) {
  if (!value) {
    return null;
  }

  return new Date(value).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const STATUS_LABELS: Record<string, string> = {
  in_progress: "In progress",
  open: "Open",
  verified: "Verified by SAVE",
  waived: "Waived",
};

export default async function PortalFindingsPage() {
  const context = await requireMinistryContext();
  const view = await getMinistryFindings(
    context.application,
    context.organization.id,
  );

  return (
    <main className="min-h-screen bg-[#F9F6F0] px-6 py-10 text-[#1A4480]">
      <div className="mx-auto max-w-6xl space-y-8">
        <MinistryNav
          active="findings"
          canPreview={context.canPreview}
          currentViewMode={context.currentViewMode}
        />

        <section className="rounded-[32px] border border-[#D8D1C3] bg-[linear-gradient(135deg,#FFFDF8_0%,#F4EFE4_100%)] p-8 shadow-[0_25px_80px_rgba(26,68,128,0.08)] md:p-10">
          <Link
            className="text-sm font-semibold text-[#7088A5] hover:text-[#1A4480]"
            href="/portal"
          >
            Back to portal
          </Link>
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.35em] text-[#7088A5]">
            Assessment
          </p>
          <h1
            className="mt-4 text-4xl leading-tight md:text-5xl"
            style={{ fontFamily: "var(--font-auth-serif)" }}
          >
            {view.shared
              ? "What your reviewer has concluded."
              : "Your findings are not ready yet."}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[#4F6357]">
            {view.shared
              ? "These are the findings your reviewer has chosen to share with you, and the work SAVE is asking you to close. SAVE keeps its own working notes, and anything said in confidence by a reference, to itself."
              : "Your reviewer has not shared findings with you yet. Nothing is hidden from you by accident — SAVE shares findings deliberately, once a reviewer is ready to stand behind them."}
          </p>
          {view.shared && view.sharedAt ? (
            <p className="mt-3 text-sm text-[#7088A5]">
              Shared with you on {formatDate(view.sharedAt)}.
            </p>
          ) : null}
        </section>

        {view.shared ? (
          <>
            <section className="rounded-[28px] border border-[#D8D1C3] bg-white p-8 shadow-[0_18px_60px_rgba(26,68,128,0.06)]">
              <h2 className="text-2xl" style={{ fontFamily: "var(--font-auth-serif)" }}>
                Findings
              </h2>
              {view.findings.length > 0 ? (
                <ul className="mt-5 space-y-5">
                  {view.findings.map((finding) => (
                    <li
                      className="border-l-2 border-[#D8D1C3] pl-5"
                      key={finding.id}
                    >
                      {finding.section ? (
                        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#7088A5]">
                          {finding.section}
                        </p>
                      ) : null}
                      <p className="mt-2 whitespace-pre-line text-base leading-8 text-[#4F6357]">
                        {finding.note}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-base leading-8 text-[#4F6357]">
                  Your reviewer has shared your roadmap but has not written any
                  findings for you to read yet.
                </p>
              )}
            </section>

            <section className="rounded-[28px] border border-[#D8D1C3] bg-white p-8 shadow-[0_18px_60px_rgba(26,68,128,0.06)]">
              <h2 className="text-2xl" style={{ fontFamily: "var(--font-auth-serif)" }}>
                What SAVE is asking you to close
              </h2>
              {view.roadmap.length > 0 ? (
                <ul className="mt-5 space-y-5">
                  {view.roadmap.map((item) => (
                    <li
                      className="rounded-2xl border border-[#E7E1D5] bg-[#FFFDF8] p-5"
                      key={item.id}
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <p className="text-lg font-semibold">{item.title}</p>
                        <span className="text-sm font-semibold text-[#7088A5]">
                          {STATUS_LABELS[item.status] ?? item.status}
                        </span>
                      </div>
                      {item.detail ? (
                        <p className="mt-2.5 text-base leading-8 text-[#4F6357]">
                          {item.detail}
                        </p>
                      ) : null}
                      <p className="mt-3 text-sm text-[#7088A5]">
                        {[
                          item.owner ? `Owner: ${item.owner}` : null,
                          item.dueDate ? `Due ${formatDate(item.dueDate)}` : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-base leading-8 text-[#4F6357]">
                  Nothing has been asked of you yet.
                </p>
              )}
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
