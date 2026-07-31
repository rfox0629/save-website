import type { Metadata } from "next";

import {
  Badge,
  Btn,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Meter,
  PageTitle,
  Stat,
  StatRow,
  Tabs,
} from "@/components/save/primitives";
import { EvidenceRow } from "@/components/save/patterns";
import { MINISTRY_ACCOUNT_CHIP, ministryNav } from "@/components/save/navs";
import { AppShell, TopBar } from "@/components/save/shell";
import { CATEGORY_LABELS, EVIDENCE } from "@/lib/preview/data";

export const metadata: Metadata = { title: "Evidence" };

export default function EvidencePage() {
  const accepted = EVIDENCE.filter((item) => item.status === "accepted");
  const needsAttention = EVIDENCE.filter(
    (item) => item.status === "needs-attention",
  );
  const missing = EVIDENCE.filter((item) => item.status === "missing");
  const inReview = EVIDENCE.filter((item) => item.status === "in-review");

  const required = EVIDENCE.filter((item) => item.required);
  const requiredAccepted = required.filter(
    (item) => item.status === "accepted",
  ).length;

  // Group by assessment category so uploading feels like completing a section.
  const grouped = EVIDENCE.reduce<Record<string, typeof EVIDENCE>>(
    (groups, item) => {
      (groups[item.category] ??= []).push(item);
      return groups;
    },
    {},
  );

  return (
    <AppShell
      account={MINISTRY_ACCOUNT_CHIP}
      groups={ministryNav("evidence")}
      persona="ministry"
      topBar={
        <TopBar
          actions={<Btn size="sm">Upload documents</Btn>}
          breadcrumb={[
            { href: "/preview/ministry", label: "Overview" },
            { label: "Evidence" },
          ]}
          status={
            needsAttention.length + missing.length > 0 ? (
              <Badge tone="clay">
                {needsAttention.length + missing.length} need you
              </Badge>
            ) : null
          }
        />
      }
    >
      <PageTitle
        description="Evidence is what turns an answer into a finding. Each document is reviewed by a person, and you will always be told why something was returned."
        eyebrow="Assessment"
      >
        Evidence
      </PageTitle>

      <div className="mt-8">
        <StatRow>
          <Stat
            caption={`${requiredAccepted} of ${required.length} required`}
            label="Accepted"
            value={accepted.length}
          />
          <Stat caption="With your reviewer" label="In review" value={inReview.length} />
          <Stat caption="Returned with notes" label="Needs attention" value={needsAttention.length} />
          <Stat caption="Not yet uploaded" label="Missing" value={missing.length} />
        </StatRow>
      </div>

      {/* ----------------------------------------------------- Upload zone -- */}
      <Card className="mt-6 border-dashed" tone="flat">
        <CardBody className="flex flex-col items-center px-6 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-50 text-ink-400">
            <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 20 20">
              <path
                d="M10 13.5V4m0 0L6.5 7.5M10 4l3.5 3.5M3.5 13v2A1.5 1.5 0 0 0 5 16.5h10a1.5 1.5 0 0 0 1.5-1.5v-2"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.4"
              />
            </svg>
          </div>
          <p className="mt-4 text-base font-semibold text-ink-900">
            Drop files here, or browse
          </p>
          <p className="mt-1.5 max-w-md text-sm text-ink-500">
            PDF, Word, Excel or images up to 25 MB. We will try to match each
            file to the right requirement automatically — you can correct it.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2.5">
            <Btn size="sm">Browse files</Btn>
            <Btn size="sm" variant="secondary">
              Connect Google Drive
            </Btn>
          </div>
        </CardBody>
      </Card>

      <div className="mt-8">
        <Tabs
          items={[
            { active: true, count: EVIDENCE.length, href: "#all", label: "All requirements" },
            { count: needsAttention.length + missing.length, href: "#action", label: "Needs you" },
            { count: inReview.length, href: "#review", label: "In review" },
            { count: accepted.length, href: "#accepted", label: "Accepted" },
          ]}
        />
      </div>

      {/* -------------------------------------------------- Needs you first */}
      {needsAttention.length + missing.length > 0 ? (
        <Card className="mt-6" id="action">
          <CardHeader
            description="Clearing these unblocks your evidence review."
            title="Needs you"
          />
          <div className="divide-y divide-hairline">
            {[...needsAttention, ...missing].map((item) => (
              <EvidenceRow
                action={
                  <Btn size="sm" variant={item.status === "missing" ? "primary" : "secondary"}>
                    {item.status === "missing" ? "Upload" : "Replace"}
                  </Btn>
                }
                item={item}
                key={item.id}
              />
            ))}
          </div>
        </Card>
      ) : null}

      {/* --------------------------------------------------- Full checklist */}
      <div className="mt-6 space-y-6" id="all">
        {Object.entries(grouped).map(([category, items]) => {
          const done = items.filter((item) => item.status === "accepted").length;

          return (
            <Card key={category}>
              <CardHeader
                action={
                  <div className="w-36">
                    <Meter
                      tone={done === items.length ? "sage" : "ink"}
                      value={(done / items.length) * 100}
                      valueLabel={`${done}/${items.length}`}
                    />
                  </div>
                }
                title={CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
              />
              <div className="divide-y divide-hairline">
                {items.map((item) => (
                  <EvidenceRow
                    action={
                      <Btn
                        size="sm"
                        variant={
                          item.status === "accepted" ? "ghost" : "secondary"
                        }
                      >
                        {item.status === "accepted"
                          ? "View"
                          : item.status === "missing"
                            ? "Upload"
                            : "Replace"}
                      </Btn>
                    }
                    item={item}
                    key={item.id}
                  />
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6">
        <CardFooter>
          <span className="text-caption text-ink-400">
            Every document is stored encrypted and is visible only to your
            assigned reviewer.
          </span>
          <Btn size="sm" variant="secondary">
            Download everything
          </Btn>
        </CardFooter>
      </Card>
    </AppShell>
  );
}
