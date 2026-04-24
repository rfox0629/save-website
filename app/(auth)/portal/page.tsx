import Link from "next/link";

import { MinistryNav } from "@/components/portal/ministry-nav";
import { Button } from "@/components/ui/button";
import {
  getPortalTimelineStatus,
  requireMinistryContext,
} from "@/lib/ministry";

const PORTAL_STEPS = [
  "Inquiry Submitted",
  "Inquiry Reviewed",
  "SAVE Standard In Progress",
  "SAVE Standard Submitted",
  "Under Review",
  "Decision",
] as const;

type PortalPageProps = {
  searchParams?: {
    welcome?: string;
  };
};

function TimelineStep({
  isComplete,
  isCurrent,
  isLast,
  label,
}: {
  isComplete: boolean;
  isCurrent: boolean;
  isLast: boolean;
  label: string;
}) {
  return (
    <div className="relative min-w-[170px] flex-1">
      {!isLast ? (
        <div className="absolute left-[calc(50%+1.5rem)] right-[-50%] top-6 h-[2px] bg-[#D7D0C3]" />
      ) : null}

      <div className="relative z-10 flex flex-col items-center text-center">
        {isComplete ? (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2F7A53] text-sm font-bold text-white shadow-[0_12px_32px_rgba(47,122,83,0.24)]">
            ✓
          </div>
        ) : isCurrent ? (
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-[#C09A45] bg-[#FFF8E8]">
            <span className="absolute inline-flex h-12 w-12 animate-ping rounded-full bg-[#C09A45]/20" />
            <span className="relative h-4 w-4 rounded-full bg-[#C09A45]" />
          </div>
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#CFC7B8] bg-white">
            <span className="h-3 w-3 rounded-full border border-[#CFC7B8] bg-transparent" />
          </div>
        )}

        <p
          className={`mt-4 max-w-[150px] text-sm font-semibold leading-5 ${
            isCurrent ? "text-[#1A4480]" : "text-[#7088A5]"
          }`}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

export default async function PortalPage({ searchParams }: PortalPageProps) {
  const {
    application,
    canPreview,
    currentViewMode,
    documents,
    organization,
    publishedBrief,
  } = await requireMinistryContext();
  const currentStep = getPortalTimelineStatus(application?.status ?? null);
  const status = application?.status ?? "inquiry_submitted";
  const showWelcome = searchParams?.welcome === "1";

  const statusContent = (() => {
    if (status === "inquiry_submitted") {
      return {
        action: null,
        body: "Your inquiry is under review. An update will be sent within 5 business days.",
        title: "Inquiry under review",
      };
    }

    if (status === "inquiry_approved") {
      return {
        action: (
          <Button
            asChild
            className="bg-[#1A4480] text-white hover:bg-[#2A5FA0]"
          >
            <Link href="/portal/application">Open Complete Application</Link>
          </Button>
        ),
        body: "Your inquiry has been approved. Your complete application is now available.",
        title: "Next step available",
      };
    }

    if (status === "inquiry_rejected") {
      return {
        action: application?.decision_notes ? (
          <p className="rounded-2xl bg-[#FFF8E8] px-4 py-3 text-sm leading-7 text-[#6C5A2F]">
            {application.decision_notes}
          </p>
        ) : null,
        body: "Your application was not approved at this time.",
        title: "Inquiry decision",
      };
    }

    if (status === "vetting_submitted") {
      return {
        action: null,
        body: "Your evaluation materials are under review. This process typically takes 2–3 weeks.",
        title: "SAVE Standard submitted",
      };
    }

    if (status === "under_review") {
      return {
        action: null,
        body: "Our review team is completing their assessment.",
        title: "Full review in progress",
      };
    }

    if (status === "approved") {
      return {
        action: publishedBrief ? (
          <Button
            asChild
            className="bg-[#1A4480] text-white hover:bg-[#2A5FA0]"
          >
            <Link href={`/donors/${publishedBrief.slug}`}>
              View published brief
            </Link>
          </Button>
        ) : null,
        body: "Congratulations. Your ministry has been approved.",
        title: "Approved",
      };
    }

    if (status === "declined") {
      return {
        action: application?.decision_notes ? (
          <p className="rounded-2xl bg-[#FFF8E8] px-4 py-3 text-sm leading-7 text-[#6C5A2F]">
            {application.decision_notes}
          </p>
        ) : null,
        body: "After careful review, your organization cannot be recommended at this time.",
        title: "Decision",
      };
    }

    return {
      action: null,
      body: "Track your application here as it moves through each SAVE milestone.",
      title: "Application overview",
    };
  })();

  return (
    <main className="min-h-screen bg-[#F9F6F0] px-6 py-10 text-[#1A4480]">
      <div className="mx-auto max-w-6xl space-y-8">
        <MinistryNav
          active="overview"
          canPreview={canPreview}
          currentViewMode={currentViewMode}
        />

        {showWelcome ? (
          <section className="rounded-[28px] border border-[#B8D2EE] bg-[#E8F0FA] px-6 py-5 text-[#1A4480]">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#2F7A53]">
              Welcome
            </p>
            <p className="mt-2 text-base leading-7">
              Your ministry account is ready. You can now complete your SAVE
              application from this portal.
            </p>
          </section>
        ) : null}

        <section className="rounded-[32px] border border-[#D8D1C3] bg-[linear-gradient(135deg,#FFFDF8_0%,#F4EFE4_100%)] p-8 shadow-[0_25px_80px_rgba(26,68,128,0.08)] md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#7088A5]">
            Ministry Portal
          </p>
          <h1
            className="mt-4 text-4xl leading-tight md:text-5xl"
            style={{ fontFamily: "var(--font-auth-serif)" }}
          >
            Welcome, {organization.legal_name}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[#4F6357]">
            This is your SAVE home base. Track your application timeline, review
            your status, and manage the documents you&apos;ve already submitted.
          </p>
        </section>

        <section className="rounded-[32px] border border-[#D8D1C3] bg-white p-6 shadow-[0_20px_60px_rgba(26,68,128,0.07)] md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7088A5]">
            Application Timeline
          </p>
          <div className="mt-8 overflow-x-auto pb-2">
            <div className="flex min-w-[980px] items-start gap-0">
              {PORTAL_STEPS.map((step, index) => {
                const stepNumber = index + 1;
                const isCurrent = stepNumber === currentStep;
                const isComplete = stepNumber < currentStep;

                return (
                  <TimelineStep
                    isComplete={isComplete}
                    isCurrent={isCurrent}
                    isLast={index === PORTAL_STEPS.length - 1}
                    key={step}
                    label={step}
                  />
                );
              })}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[32px] border border-[#D8D1C3] bg-white p-8 shadow-[0_20px_60px_rgba(26,68,128,0.07)]">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7088A5]">
              Status
            </p>
            <h2
              className="mt-4 text-3xl"
              style={{ fontFamily: "var(--font-auth-serif)" }}
            >
              {statusContent.title}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[#4F6357]">
              {statusContent.body}
            </p>

            {statusContent.action ? (
              <div className="mt-6">{statusContent.action}</div>
            ) : null}
          </div>

          <div className="rounded-[32px] border border-[#D8D1C3] bg-[#FFFDF8] p-8 shadow-[0_20px_60px_rgba(26,68,128,0.07)]">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7088A5]">
              Quick Links
            </p>
            <div className="mt-6 grid gap-3">
              <Link
                className="rounded-2xl border border-[#D8D1C3] px-5 py-4 text-sm font-semibold text-[#1A4480] transition hover:bg-[#F4EFE4]"
                href="/portal"
              >
                Overview
              </Link>
              <Link
                className="rounded-2xl border border-[#D8D1C3] px-5 py-4 text-sm font-semibold text-[#1A4480] transition hover:bg-[#F4EFE4]"
                href="/portal/inquiry"
              >
                Inquiry
              </Link>
              <Link
                className="rounded-2xl border border-[#D8D1C3] px-5 py-4 text-sm font-semibold text-[#1A4480] transition hover:bg-[#F4EFE4]"
                href="/portal/application"
              >
                Complete Application
              </Link>
              <Link
                className="rounded-2xl border border-[#D8D1C3] px-5 py-4 text-sm font-semibold text-[#1A4480] transition hover:bg-[#F4EFE4]"
                href="/portal/documents"
              >
                Documents
              </Link>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-[#D8D1C3] bg-white shadow-[0_20px_60px_rgba(26,68,128,0.07)]">
          <div className="border-b border-[#E5DED1] px-8 py-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7088A5]">
              Documents
            </p>
            <h2
              className="mt-3 text-3xl"
              style={{ fontFamily: "var(--font-auth-serif)" }}
            >
              Uploaded files
            </h2>
            <p className="mt-3 text-base leading-8 text-[#4F6357]">
              Review the materials currently attached to your application.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[#E5DED1] bg-[#FFFDF8] text-[#7088A5]">
                <tr>
                  <th className="px-8 py-4 font-semibold">Name</th>
                  <th className="px-8 py-4 font-semibold">Type</th>
                  <th className="px-8 py-4 font-semibold">Upload Date</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((document) => (
                  <tr className="border-b border-[#F0EBE0]" key={document.id}>
                    <td className="px-8 py-5">
                      {document.signedUrl ? (
                        <a
                          className="font-medium text-[#1A4480] underline-offset-4 hover:underline"
                          href={document.signedUrl}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {document.file_name}
                        </a>
                      ) : (
                        <span className="font-medium text-[#1A4480]">
                          {document.file_name}
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-[#4F6357]">
                      {document.document_type}
                    </td>
                    <td className="px-8 py-5 text-[#4F6357]">
                      {new Date(document.uploaded_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}

                {documents.length === 0 ? (
                  <tr>
                    <td
                      className="px-8 py-10 text-center text-[#7C8C82]"
                      colSpan={3}
                    >
                      No documents uploaded yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
