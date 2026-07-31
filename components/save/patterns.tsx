import Link from "next/link";
import type { ReactNode } from "react";

import {
  Badge,
  type BadgeTone,
  Btn,
  Card,
  Meter,
  Monogram,
  SealMark,
  TrustSeal,
  formatDate,
  formatMoney,
} from "@/components/save/primitives";
import {
  CATEGORY_LABELS,
  type CategoryScore,
  type EvidenceItem,
  type Finding,
  type ImpactMetric,
  type Ministry,
  type MinistryUpdate,
  type PrayerRequest,
  type RoadmapItem,
  TIER_TONE,
  type Testimony,
} from "@/lib/preview/data";
import { cn } from "@/lib/utils";

/* ==========================================================================
   SAVE domain patterns
   Shared by public, donor, ministry and staff surfaces. A ministry looks the
   same everywhere it appears; only the affordances around it change.
   ========================================================================== */

/* ------------------------------------------------------------- Ministry -- */

export function MinistryCard({
  action,
  href,
  ministry,
  showScore = true,
}: {
  action?: ReactNode;
  href: string;
  ministry: Ministry;
  showScore?: boolean;
}) {
  return (
    <Card className="group flex h-full flex-col transition duration-200 ease-save hover:-translate-y-0.5 hover:shadow-e3">
      <Link className="flex flex-1 flex-col p-6" href={href}>
        <div className="flex items-start justify-between gap-4">
          <Monogram name={ministry.name} size="lg" />
          {showScore ? (
            <div className="text-right">
              <p className="save-numeric save-display text-title font-semibold text-ink-900">
                {ministry.score}
              </p>
              <p className="save-eyebrow mt-0.5 text-ink-400">SAVE score</p>
            </div>
          ) : null}
        </div>

        <h3 className="mt-4 text-lg font-semibold leading-snug text-ink-900 transition group-hover:text-ink-700">
          {ministry.name}
        </h3>
        <p className="mt-1 text-caption text-ink-400">
          {ministry.category} · {ministry.location}
        </p>

        <p className="mt-3.5 flex-1 text-sm leading-relaxed text-ink-500">
          {ministry.summary}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <TrustSeal
            size="sm"
            tier={ministry.tier}
            year={new Date(ministry.assessedOn).getFullYear()}
          />
        </div>
      </Link>
      {action ? (
        <div className="border-t border-hairline px-6 py-3.5">{action}</div>
      ) : null}
    </Card>
  );
}

/** Compact row for dashboards and following lists. */
export function MinistryRow({
  href,
  meta,
  ministry,
  trailing,
}: {
  href: string;
  meta?: ReactNode;
  ministry: Ministry;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 px-6 py-4 transition hover:bg-paper-100">
      <Monogram name={ministry.name} size="md" />
      <div className="min-w-0 flex-1">
        <Link
          className="block truncate text-sm font-semibold text-ink-900 hover:text-ink-600"
          href={href}
        >
          {ministry.name}
        </Link>
        <p className="mt-0.5 truncate text-caption text-ink-400">
          {meta ?? `${ministry.category} · ${ministry.location}`}
        </p>
      </div>
      {trailing}
    </div>
  );
}

/** The six-category assessment breakdown. Identical on donor and staff views. */
export function CategoryBreakdown({
  scores,
  showNotes = true,
}: {
  scores: CategoryScore[];
  showNotes?: boolean;
}) {
  return (
    <ul className="divide-y divide-hairline">
      {scores.map((category) => (
        <li className="py-4 first:pt-0 last:pb-0" key={category.key}>
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-sm font-semibold text-ink-900">
              {CATEGORY_LABELS[category.key]}
            </p>
            <div className="flex items-center gap-3">
              <ConfidenceMark level={category.confidence} />
              <span className="save-numeric text-sm font-semibold text-ink-900">
                {category.score}
              </span>
            </div>
          </div>
          <div className="mt-2.5">
            <Meter
              tone={
                category.score >= 88
                  ? "sage"
                  : category.score >= 75
                    ? "brass"
                    : "clay"
              }
              value={category.score}
            />
          </div>
          {showNotes ? (
            <p className="mt-2.5 text-caption leading-relaxed text-ink-500">
              {category.note}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function ConfidenceMark({
  level,
}: {
  level: "high" | "medium" | "low";
}) {
  return (
    <span className="flex items-center gap-0.5" title={`${level} confidence`}>
      {[0, 1, 2].map((index) => (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            (level === "high" && index <= 2) ||
              (level === "medium" && index <= 1) ||
              (level === "low" && index === 0)
              ? level === "high"
                ? "bg-sage-500"
                : level === "medium"
                  ? "bg-brass-400"
                  : "bg-clay-500"
              : "bg-paper-300",
          )}
          key={index}
        />
      ))}
    </span>
  );
}

/** Impact figures. Deliberately typeset like a report, not a scoreboard. */
export function ImpactGrid({ metrics }: { metrics: ImpactMetric[] }) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-hairline md:grid-cols-4">
      {metrics.map((metric) => (
        <div className="bg-surface px-5 py-5" key={metric.label}>
          <p className="save-numeric save-display text-display-sm font-semibold text-ink-900">
            {metric.value}
          </p>
          <p className="mt-2 text-caption font-medium leading-snug text-ink-700">
            {metric.label}
          </p>
          <p className="mt-1 text-micro uppercase tracking-[0.08em] text-ink-400">
            {metric.period}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------- Relationship UI -- */

export function TestimonyCard({ testimony }: { testimony: Testimony }) {
  return (
    <figure className="bg-brass-50/50 rounded-lg border border-hairline px-6 py-6">
      <svg
        aria-hidden="true"
        className="h-5 w-5 text-brass-400"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M8 4.5C5.2 5.6 3 8.4 3 11.6c0 2.3 1.4 3.9 3.4 3.9 1.8 0 3.1-1.3 3.1-3s-1.2-2.9-2.8-2.9c-.3 0-.6 0-.8.1.4-1.4 1.6-2.7 3.1-3.4L8 4.5Zm8.4 0c-2.8 1.1-5 3.9-5 7.1 0 2.3 1.4 3.9 3.4 3.9 1.8 0 3.1-1.3 3.1-3s-1.2-2.9-2.8-2.9c-.3 0-.6 0-.8.1.4-1.4 1.6-2.7 3.1-3.4l-1-1.8Z" />
      </svg>
      <blockquote className="save-display mt-3.5 text-lg leading-relaxed text-ink-800">
        {testimony.quote}
      </blockquote>
      <figcaption className="mt-4 flex items-center gap-3 border-t border-hairline pt-4">
        <Monogram name={testimony.attribution} size="sm" tone="brass" />
        <div>
          <p className="text-caption font-semibold text-ink-900">
            {testimony.attribution}
          </p>
          <p className="text-micro uppercase tracking-[0.08em] text-ink-400">
            {testimony.role}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}

const UPDATE_TONE: Record<MinistryUpdate["kind"], BadgeTone> = {
  financial: "ink",
  "field-report": "neutral",
  milestone: "sage",
  "prayer-answered": "brass",
};

const UPDATE_LABEL: Record<MinistryUpdate["kind"], string> = {
  financial: "Financial",
  "field-report": "From the field",
  milestone: "Milestone",
  "prayer-answered": "Answered prayer",
};

export function UpdateItem({
  ministryName,
  update,
}: {
  ministryName?: string;
  update: MinistryUpdate;
}) {
  return (
    <article className="flex gap-4 px-6 py-5">
      <div className="mt-1 flex flex-col items-center">
        <span
          className={cn(
            "h-2 w-2 rounded-full",
            update.kind === "milestone" ? "bg-sage-500" : "bg-ink-300",
          )}
        />
        <span className="mt-2 w-px flex-1 bg-hairline" />
      </div>
      <div className="min-w-0 flex-1 pb-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge tone={UPDATE_TONE[update.kind]}>
            {UPDATE_LABEL[update.kind]}
          </Badge>
          <span className="save-numeric text-caption text-ink-400">
            {formatDate(update.date)}
          </span>
        </div>
        <h4 className="mt-2.5 text-sm font-semibold text-ink-900">
          {update.title}
        </h4>
        {ministryName ? (
          <p className="mt-0.5 text-caption text-ink-400">{ministryName}</p>
        ) : null}
        <p className="mt-1.5 text-sm leading-relaxed text-ink-600">
          {update.body}
        </p>
      </div>
    </article>
  );
}

export function PrayerCard({
  ministryName,
  request,
}: {
  ministryName?: string;
  request: PrayerRequest;
}) {
  return (
    <Card className="p-5" tone="flat">
      <div className="flex items-center justify-between gap-3">
        {request.urgent ? (
          <Badge tone="clay">Urgent</Badge>
        ) : (
          <Badge tone="neutral">Prayer</Badge>
        )}
        <span className="save-numeric text-caption text-ink-400">
          {formatDate(request.date)}
        </span>
      </div>
      {ministryName ? (
        <p className="mt-3 text-caption font-semibold text-ink-700">
          {ministryName}
        </p>
      ) : null}
      <p className="mt-2 text-sm leading-relaxed text-ink-600">
        {request.body}
      </p>
      <div className="mt-4 flex items-center justify-between border-t border-hairline pt-3.5">
        <span className="save-numeric text-caption text-ink-400">
          {request.praying} praying
        </span>
        <Btn size="sm" variant="secondary">
          <svg
            aria-hidden="true"
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 16 16"
          >
            <path
              d="M8 13.5S2 10 2 6.2A3.2 3.2 0 0 1 8 4.6a3.2 3.2 0 0 1 6 1.6C14 10 8 13.5 8 13.5Z"
              stroke="currentColor"
              strokeLinejoin="round"
              strokeWidth="1.3"
            />
          </svg>
          I&apos;m praying
        </Btn>
      </div>
    </Card>
  );
}

/* ---------------------------------------------------------- Ministry ops -- */

const EVIDENCE_TONE: Record<EvidenceItem["status"], BadgeTone> = {
  accepted: "sage",
  "in-review": "ink",
  "needs-attention": "clay",
  missing: "neutral",
};

const EVIDENCE_LABEL: Record<EvidenceItem["status"], string> = {
  accepted: "Accepted",
  "in-review": "In review",
  "needs-attention": "Needs attention",
  missing: "Not uploaded",
};

export function EvidenceRow({
  action,
  item,
}: {
  action?: ReactNode;
  item: EvidenceItem;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 px-6 py-4">
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
          item.status === "missing"
            ? "border border-dashed border-paper-400 text-ink-300"
            : "bg-ink-50 text-ink-500",
        )}
      >
        <svg
          aria-hidden="true"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 16 16"
        >
          <path
            d="M9 1.5H4.5A1.5 1.5 0 0 0 3 3v10A1.5 1.5 0 0 0 4.5 14.5h7A1.5 1.5 0 0 0 13 13V5.5L9 1.5Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.2"
          />
          <path
            d="M9 1.5v4h4"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.2"
          />
        </svg>
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-ink-900">{item.name}</p>
          {item.required ? (
            <span className="text-micro uppercase tracking-[0.08em] text-brass-700">
              Required
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 text-caption text-ink-400">
          {CATEGORY_LABELS[item.category]}
          {item.uploaded ? ` · Uploaded ${formatDate(item.uploaded)}` : ""}
          {item.size ? ` · ${item.size}` : ""}
        </p>
        {item.note ? (
          <p className="mt-2 rounded-md bg-clay-50 px-3 py-2 text-caption leading-relaxed text-clay-700">
            {item.note}
          </p>
        ) : null}
      </div>

      <Badge tone={EVIDENCE_TONE[item.status]}>
        {EVIDENCE_LABEL[item.status]}
      </Badge>
      {action}
    </div>
  );
}

const FINDING_TONE: Record<Finding["severity"], BadgeTone> = {
  gap: "clay",
  observation: "neutral",
  risk: "risk",
  strength: "sage",
};

const FINDING_LABEL: Record<Finding["severity"], string> = {
  gap: "Gap",
  observation: "Observation",
  risk: "Risk",
  strength: "Strength",
};

export function FindingRow({
  action,
  finding,
}: {
  action?: ReactNode;
  finding: Finding;
}) {
  return (
    <div className="flex flex-wrap items-start gap-4 px-6 py-5">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge tone={FINDING_TONE[finding.severity]}>
            {FINDING_LABEL[finding.severity]}
          </Badge>
          <span className="text-caption text-ink-400">
            {CATEGORY_LABELS[finding.category]}
          </span>
        </div>
        <h4 className="mt-2.5 text-sm font-semibold text-ink-900">
          {finding.title}
        </h4>
        <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-ink-600">
          {finding.detail}
        </p>
      </div>
      {action}
    </div>
  );
}

const ROADMAP_TONE: Record<RoadmapItem["status"], BadgeTone> = {
  "in-progress": "ink",
  "not-started": "neutral",
  submitted: "brass",
  verified: "sage",
};

const ROADMAP_LABEL: Record<RoadmapItem["status"], string> = {
  "in-progress": "In progress",
  "not-started": "Not started",
  submitted: "Submitted",
  verified: "Verified by SAVE",
};

export function RoadmapRow({ item }: { item: RoadmapItem }) {
  return (
    <div className="flex flex-wrap items-start gap-4 px-6 py-4">
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border",
          item.status === "verified"
            ? "border-sage-600 bg-sage-600 text-paper-50"
            : "border-hairline-strong bg-surface",
        )}
      >
        {item.status === "verified" ? (
          <svg
            aria-hidden="true"
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 12 12"
          >
            <path
              d="m2.5 6.2 2.4 2.4L9.5 3.8"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.6"
            />
          </svg>
        ) : null}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink-900">{item.title}</p>
        <p className="mt-1 max-w-prose text-caption leading-relaxed text-ink-500">
          {item.detail}
        </p>
        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-ink-400">
          <span>Owner · {item.owner}</span>
          <span className="save-numeric">Due {formatDate(item.due)}</span>
          <span className="capitalize">{item.effort} effort</span>
        </div>
      </div>

      <Badge tone={ROADMAP_TONE[item.status]}>
        {ROADMAP_LABEL[item.status]}
      </Badge>
    </div>
  );
}

/* ------------------------------------------------------------- Giving UI -- */

export function GiftRow({
  gift,
  ministryName,
}: {
  gift: {
    amount: number;
    date: string;
    designation: string;
    method: string;
    receipted: boolean;
  };
  ministryName: string;
}) {
  return (
    <tr className="transition hover:bg-paper-100">
      <td className="save-numeric border-b border-hairline px-6 py-4 text-sm text-ink-500">
        {formatDate(gift.date)}
      </td>
      <td className="border-b border-hairline px-6 py-4">
        <p className="text-sm font-medium text-ink-900">{ministryName}</p>
        <p className="mt-0.5 text-caption text-ink-400">{gift.designation}</p>
      </td>
      <td className="border-b border-hairline px-6 py-4 text-sm text-ink-500">
        {gift.method}
      </td>
      <td className="border-b border-hairline px-6 py-4 text-right">
        {gift.receipted ? (
          <Badge tone="sage">Receipted</Badge>
        ) : (
          <Badge tone="clay">Pending</Badge>
        )}
      </td>
      <td className="save-numeric border-b border-hairline px-6 py-4 text-right text-sm font-semibold text-ink-900">
        {formatMoney(gift.amount)}
      </td>
    </tr>
  );
}

/* -------------------------------------------------------------- Verified -- */

/**
 * The assessment provenance block. Wherever a score appears to a donor, this
 * appears near it — a score without provenance is just a number.
 */
export function AssessmentProvenance({
  assessedOn,
  reassessmentDue,
  reviewer = "SAVE assessment team",
}: {
  assessedOn: string;
  reassessmentDue: string;
  reviewer?: string;
}) {
  return (
    <Card className="p-5" tone="seal">
      <div className="flex items-start gap-3">
        <SealMark className="mt-0.5 h-4 w-4 shrink-0 text-brass-700" />
        <div>
          <p className="text-caption font-semibold text-brass-700">
            Independently assessed by SAVE
          </p>
          <p className="save-numeric text-brass-700/80 mt-1.5 text-caption leading-relaxed">
            Assessed {formatDate(assessedOn)} by {reviewer}. Reassessment due{" "}
            {formatDate(reassessmentDue)}.
          </p>
          <p className="text-brass-700/70 mt-2 text-caption">
            No ministry pays SAVE for a recommendation.
          </p>
        </div>
      </div>
    </Card>
  );
}

export function TierExplainer({ tier }: { tier: Ministry["tier"] }) {
  const copy: Record<Ministry["tier"], string> = {
    "High Confidence Opportunity":
      "Every category assessed at high confidence with no unresolved risks. Suited to a long-term, significant relationship.",
    "Strong Opportunity":
      "Strong across the standard with one or two areas we are still watching. Worth a relationship and a conversation.",
    "Proceed with Discernment":
      "Real fruit alongside open questions. We recommend meeting the leadership before committing.",
    "Not Recommended":
      "Unresolved concerns against the standard. We do not recommend a giving relationship at this time.",
  };

  return (
    <div className="flex flex-wrap items-start gap-3">
      <Badge tone={TIER_TONE[tier]}>{tier}</Badge>
      <p className="min-w-0 flex-1 text-sm leading-relaxed text-ink-500">
        {copy[tier]}
      </p>
    </div>
  );
}
