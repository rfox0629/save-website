import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  getPortalTimelineStatus,
  requireMinistryContext,
} from "@/lib/ministry";

const PORTAL_STEPS = [
  "Inquiry Submitted",
  "Inquiry Reviewed",
  "Vetting In Progress",
  "Vetting Submitted",
  "Under Review",
  "Decision",
] as const;

export default async function PortalPage() {
  const { application, organization, publishedBrief } =
    await requireMinistryContext();
  const currentStep = getPortalTimelineStatus(application?.status ?? null);
  const status = application?.status ?? "inquiry_submitted";

  return (
    <main className="min-h-screen bg-[#0B1622] px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(192,154,69,0.18),rgba(11,22,34,0.2)_35%,rgba(76,125,155,0.16))] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
          <p className="text-sm uppercase tracking-[0.35em] text-[#C09A45]">
            Ministry Portal
          </p>
          <h1 className="mt-4 text-4xl font-semibold">
            {organization.legal_name}
          </h1>
          <p className="mt-4 max-w-3xl leading-7 text-slate-300">
            Track your application, review supporting documents, and respond to
            the next step as your ministry moves through SAVE&apos;s process.
          </p>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <div className="grid gap-4 md:grid-cols-6">
            {PORTAL_STEPS.map((step, index) => {
              const stepNumber = index + 1;
              const isCurrent = stepNumber === currentStep;
              const isComplete = stepNumber < currentStep;

              return (
                <div
                  key={step}
                  className="relative rounded-3xl border border-white/10 bg-[#0B1622]/50 p-4"
                >
                  <div
                    className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold ${
                      isCurrent
                        ? "border-[#C09A45] bg-[#C09A45] text-[#0B1622]"
                        : isComplete
                          ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-200"
                          : "border-white/10 bg-white/[0.03] text-slate-400"
                    }`}
                  >
                    {stepNumber}
                  </div>
                  <p
                    className={`text-sm font-medium ${
                      isCurrent ? "text-white" : "text-slate-300"
                    }`}
                  >
                    {step}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8">
            {status === "inquiry_submitted" ? (
              <>
                <h2 className="text-2xl font-semibold text-white">
                  Your inquiry is under review
                </h2>
                <p className="mt-4 max-w-2xl leading-7 text-slate-300">
                  We&apos;ll contact you within 5 business days.
                </p>
              </>
            ) : null}

            {status === "inquiry_approved" ? (
              <>
                <h2 className="text-2xl font-semibold text-white">
                  Congratulations. Your deep vetting form is now available.
                </h2>
                <p className="mt-4 max-w-2xl leading-7 text-slate-300">
                  Please complete the next diligence step when you&apos;re
                  ready.
                </p>
                <div className="mt-6">
                  <Button
                    asChild
                    className="bg-[#C09A45] text-[#0B1622] hover:bg-[#d4ac57]"
                  >
                    <Link href="/portal/vetting">Open deep vetting form</Link>
                  </Button>
                </div>
              </>
            ) : null}

            {status === "inquiry_rejected" || status === "declined" ? (
              <>
                <h2 className="text-2xl font-semibold text-white">
                  Application update
                </h2>
                <p className="mt-4 leading-7 text-slate-300">
                  {application?.decision_notes ??
                    "We are not moving forward at this stage."}
                </p>
              </>
            ) : null}

            {(status === "approved" || status === "decided") &&
            publishedBrief ? (
              <>
                <h2 className="text-2xl font-semibold text-white">
                  Your brief is published
                </h2>
                <p className="mt-4 max-w-2xl leading-7 text-slate-300">
                  Your approved donor-facing brief is now available.
                </p>
                <div className="mt-6">
                  <Button
                    asChild
                    className="bg-[#C09A45] text-[#0B1622] hover:bg-[#d4ac57]"
                  >
                    <Link href={`/brief/${publishedBrief.slug}`}>
                      View published brief
                    </Link>
                  </Button>
                </div>
              </>
            ) : null}

            {status === "vetting_submitted" || status === "under_review" ? (
              <>
                <h2 className="text-2xl font-semibold text-white">
                  Your application is advancing
                </h2>
                <p className="mt-4 max-w-2xl leading-7 text-slate-300">
                  Our team is reviewing your submitted materials. We&apos;ll
                  reach out if we need anything else.
                </p>
              </>
            ) : null}
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8">
            <h2 className="text-xl font-semibold text-white">Quick links</h2>
            <div className="mt-6 grid gap-3">
              <Link
                className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.04]"
                href="/portal/inquiry"
              >
                Inquiry form
              </Link>
              <Link
                className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.04]"
                href="/portal/vetting"
              >
                Deep vetting form
              </Link>
              <Link
                className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.04]"
                href="/portal/documents"
              >
                Document center
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
