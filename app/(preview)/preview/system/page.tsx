import type { Metadata } from "next";

import {
  Badge,
  Btn,
  Callout,
  Card,
  CardBody,
  CardHeader,
  DataList,
  DataRow,
  EmptyState,
  Field,
  Input,
  Meter,
  Monogram,
  ScoreDial,
  SectionTitle,
  Select,
  Stat,
  StatRow,
  Steps,
  Table,
  Tabs,
  Td,
  Textarea,
  Th,
  TrustSeal,
} from "@/components/save/primitives";
import { SaveWordmark } from "@/components/save/shell";

export const metadata: Metadata = { title: "Design language" };

/**
 * Swatches read straight from the CSS custom properties rather than Tailwind
 * classes, so the page cannot drift from the tokens it documents. `token` is
 * the CSS variable prefix; `name` is the Tailwind scale it is exposed as.
 */
const RAMPS = [
  { label: "Ink — text, primary action, authority", name: "ink", steps: [900, 800, 700, 600, 500, 400, 300, 200, 100, 50], token: "ink" },
  { label: "Paper — surfaces and rules. The warm signature.", name: "paper", steps: [500, 400, 300, 200, 100, 50], token: "paper" },
  { label: "Brass — verification only. Never a generic accent.", name: "brass", steps: [700, 600, 500, 400, 200, 100, 50], token: "brass" },
  { label: "Sage — healthy, approved, on track", name: "sage", steps: [700, 600, 500, 100, 50], token: "sage" },
  { label: "Clay — attention, in progress, needs work", name: "clay", steps: [700, 600, 500, 100, 50], token: "clay" },
  { label: "Risk — declined, hard stop. Warm, never neon.", name: "risk", steps: [700, 600, 100, 50], token: "rose" },
];

const TYPE = [
  { class: "text-display-xl save-display", label: "Display XL · 56/60", sample: "Give with conviction" },
  { class: "text-display-lg save-display", label: "Display LG · 44/48", sample: "Ministries worth a lifetime" },
  { class: "text-display-md save-display", label: "Display MD · 34/40", sample: "New City Fellowship Network" },
  { class: "text-display-sm save-display", label: "Display SM · 26/32", sample: "The assessment" },
  { class: "text-title", label: "Title · 20/28", sample: "Six categories, one standard" },
  { class: "text-lg", label: "Large · 17/26", sample: "Planting churches that outlive their planters." },
  { class: "text-base", label: "Base · 15/24", sample: "Every ministry answers the same questions and supplies the same evidence." },
  { class: "text-sm", label: "Small · 13.5/20", sample: "Assessed 14 March 2026 by the SAVE assessment team." },
  { class: "text-caption", label: "Caption · 13/18", sample: "Reassessment due 14 March 2028" },
  { class: "save-eyebrow", label: "Eyebrow · 11/1 · 0.12em", sample: "The SAVE Standard" },
];

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-paper-100">
      <header className="border-b border-hairline bg-paper-200">
        <div className="mx-auto max-w-content px-5 py-12 md:px-8">
          <SaveWordmark sublabel="Design language" />
          <h1 className="save-display mt-8 text-display-lg font-semibold text-ink-900">
            The SAVE design language
          </h1>
          <p className="mt-4 max-w-prose text-lg leading-relaxed text-ink-500">
            One token set, one type scale, one component library. Everything in
            the product is composed from what is on this page.
          </p>
          <Btn className="mt-7" href="/preview" variant="secondary">
            ← All surfaces
          </Btn>
        </div>
      </header>

      <main className="mx-auto max-w-content space-y-12 px-5 py-12 md:px-8">
        {/* ------------------------------------------------------ Principles */}
        <section>
          <SectionTitle description="Five rules that decide every judgement call.">
            Principles
          </SectionTitle>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { body: "Every neutral carries warmth. Cold grays read as software; warm paper reads as a document worth trusting.", title: "Warm paper, not cold gray" },
              { body: "Navy is authority. It carries text and primary action and is never used decoratively.", title: "Ink is navy" },
              { body: "Brass marks verification and nothing else. If it appears, SAVE has assessed something.", title: "Brass is earned" },
              { body: "Whitespace is the premium signal. When a screen feels cramped, remove content rather than shrink it.", title: "Whitespace over density" },
              { body: "Money, scores, dates and counts are always tabular. A donor should be able to compare down a column.", title: "Numbers are typeset" },
            ].map((principle) => (
              <Card className="p-6" key={principle.title}>
                <p className="text-sm font-semibold text-ink-900">
                  {principle.title}
                </p>
                <p className="mt-2 text-caption leading-relaxed text-ink-500">
                  {principle.body}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* ---------------------------------------------------------- Colour */}
        <section>
          <SectionTitle description="Six ramps replacing 96 distinct hardcoded hex values in the current codebase.">
            Colour
          </SectionTitle>
          <div className="space-y-5">
            {RAMPS.map((ramp) => (
              <Card className="p-6" key={ramp.name}>
                <p className="text-sm font-semibold text-ink-900">
                  {ramp.label}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {ramp.steps.map((step) => (
                    <div key={step}>
                      <div
                        className="h-14 w-20 rounded-md border border-hairline"
                        style={{
                          backgroundColor: `var(--save-${ramp.token}-${step})`,
                        }}
                      />
                      <p className="save-numeric mt-1.5 text-micro text-ink-400">
                        {ramp.name}-{step}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------ Typography */}
        <section>
          <SectionTitle description="Fraunces for display, Inter for interface. One scale, each size paired with its line height and tracking.">
            Typography
          </SectionTitle>
          <Card>
            <div className="divide-y divide-hairline">
              {TYPE.map((entry) => (
                <div
                  className="flex flex-col gap-2 px-6 py-5 md:flex-row md:items-baseline md:gap-8"
                  key={entry.label}
                >
                  <p className="save-eyebrow w-44 shrink-0 text-ink-400">
                    {entry.label}
                  </p>
                  <p className={`min-w-0 text-ink-900 ${entry.class}`}>
                    {entry.sample}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* --------------------------------------------------------- Buttons */}
        <section>
          <SectionTitle description="Three sizes, six variants. Nothing in the product uses a bespoke button.">
            Buttons
          </SectionTitle>
          <Card className="p-7">
            <div className="space-y-6">
              {(["lg", "md", "sm"] as const).map((size) => (
                <div className="flex flex-wrap items-center gap-3" key={size}>
                  <Btn size={size}>Primary</Btn>
                  <Btn size={size} variant="secondary">
                    Secondary
                  </Btn>
                  <Btn size={size} variant="ghost">
                    Ghost
                  </Btn>
                  <Btn size={size} variant="brass">
                    Brass
                  </Btn>
                  <Btn size={size} variant="danger">
                    Danger
                  </Btn>
                  <Btn size={size} variant="quiet">
                    Quiet
                  </Btn>
                  <Btn disabled size={size}>
                    Disabled
                  </Btn>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* ------------------------------------------------------- Status UI */}
        <section>
          <SectionTitle description="Status is always colour plus text. Colour alone never carries meaning.">
            Status
          </SectionTitle>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-7">
              <p className="save-eyebrow mb-4 text-ink-400">Badges</p>
              <div className="flex flex-wrap gap-2.5">
                <Badge tone="neutral">Neutral</Badge>
                <Badge tone="ink">In review</Badge>
                <Badge tone="sage">Accepted</Badge>
                <Badge tone="brass">Awaiting</Badge>
                <Badge tone="clay">Needs attention</Badge>
                <Badge tone="risk">Hard stop</Badge>
                <Badge dot tone="sage">
                  With dot
                </Badge>
              </div>

              <p className="save-eyebrow mb-4 mt-8 text-ink-400">Trust seal</p>
              <div className="flex flex-wrap items-center gap-3">
                <TrustSeal size="sm" tier="Strong Opportunity" year={2026} />
                <TrustSeal size="md" tier="High Confidence Opportunity" year={2026} />
              </div>

              <p className="save-eyebrow mb-4 mt-8 text-ink-400">Monograms</p>
              <div className="flex flex-wrap items-center gap-3">
                <Monogram name="New City" size="sm" />
                <Monogram name="Living Water" size="md" tone="sage" />
                <Monogram name="Harvest Bible" size="lg" tone="brass" />
                <Monogram name="Rio Hope" size="xl" tone="clay" />
              </div>
            </Card>

            <Card className="p-7">
              <p className="save-eyebrow mb-4 text-ink-400">Callouts</p>
              <div className="space-y-3">
                <Callout title="Informational" tone="ink">
                  Explains why a question is being asked.
                </Callout>
                <Callout title="Positive" tone="sage">
                  Confirms something is working.
                </Callout>
                <Callout title="Needs attention" tone="clay">
                  Something is blocking progress.
                </Callout>
                <Callout title="Risk" tone="risk">
                  Requires a decision, not a document.
                </Callout>
              </div>
            </Card>
          </div>
        </section>

        {/* ------------------------------------------------------------ Data */}
        <section>
          <SectionTitle description="Every figure in the product renders through these three components.">
            Data display
          </SectionTitle>
          <div className="space-y-6">
            <StatRow>
              <Stat caption="Across 4 ministries" label="Given this year" value="$285,000" />
              <Stat delta={{ direction: "up", label: "12% vs 2025" }} label="Lifetime giving" value="$1,642,500" />
              <Stat delta={{ direction: "down", label: "4 days vs Q1" }} label="Median days to decision" value="34" />
              <Stat delta={{ direction: "flat", label: "unchanged" }} label="Approval rate" value="62%" />
            </StatRow>

            <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
              <Card className="flex items-center justify-center p-8">
                <ScoreDial label="SAVE score" score={92} />
              </Card>

              <Card className="p-7">
                <p className="save-eyebrow mb-5 text-ink-400">Meters</p>
                <div className="space-y-5">
                  <Meter label="Doctrine" tone="sage" value={96} />
                  <Meter label="Financial Integrity" tone="brass" value={81} />
                  <Meter label="Leadership" tone="clay" value={71} />
                  <Meter label="Assessment complete" tone="ink" value={52} valueLabel="52/100" />
                </div>

                <p className="save-eyebrow mb-4 mt-8 text-ink-400">Data list</p>
                <DataList>
                  <DataRow label="Annual budget" value="$2,480,000" />
                  <DataRow label="Staff" value="24" />
                  <DataRow label="EIN" value="84-2210398" />
                </DataList>
              </Card>
            </div>

            <Card>
              <CardHeader title="Table" description="One table style. Tabular figures, hairline rules, generous rows." />
              <Table>
                <thead>
                  <tr>
                    <Th>Ministry</Th>
                    <Th>Stage</Th>
                    <Th align="right">Score</Th>
                    <Th align="right">Budget</Th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { budget: "$2,480,000", ministry: "New City Fellowship Network", score: 92, stage: "Published" },
                    { budget: "$1,150,000", ministry: "Living Water East Africa", score: 84, stage: "Published" },
                    { budget: "$1,720,000", ministry: "Rio Hope Church Network", score: 87, stage: "Evidence review" },
                  ].map((row) => (
                    <tr className="transition hover:bg-paper-100" key={row.ministry}>
                      <Td>
                        <span className="font-medium text-ink-900">{row.ministry}</span>
                      </Td>
                      <Td>
                        <Badge tone={row.stage === "Published" ? "sage" : "ink"}>
                          {row.stage}
                        </Badge>
                      </Td>
                      <Td align="right" numeric>
                        {row.score}
                      </Td>
                      <Td align="right" numeric>
                        {row.budget}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </div>
        </section>

        {/* ----------------------------------------------------------- Forms */}
        <section>
          <SectionTitle description="One control height, one focus treatment, labels always above.">
            Forms
          </SectionTitle>
          <Card>
            <CardBody className="grid gap-6 md:grid-cols-2">
              <Field help="Shown beneath the field." hint="Optional hint" label="Text input" required>
                <Input defaultValue="New City Fellowship Network" />
              </Field>
              <Field label="Select">
                <Select>
                  <option>Full audit by an independent CPA firm</option>
                  <option>Financial review</option>
                </Select>
              </Field>
              <div className="md:col-span-2">
                <Field help="Three or four sentences." label="Long form">
                  <Textarea rows={4} defaultValue="When a designated fund is oversubscribed we contact each donor individually." />
                </Field>
              </div>
            </CardBody>
          </Card>
        </section>

        {/* ------------------------------------------------------ Wayfinding */}
        <section>
          <SectionTitle description="Tabs for peer views, Steps for a journey with a beginning and an end.">
            Wayfinding
          </SectionTitle>
          <div className="space-y-6">
            <Card className="p-7">
              <Tabs
                items={[
                  { active: true, count: 9, href: "#a", label: "All requirements" },
                  { count: 3, href: "#b", label: "Needs you" },
                  { count: 1, href: "#c", label: "In review" },
                  { count: 5, href: "#d", label: "Accepted" },
                ]}
              />
            </Card>

            <Card className="p-8">
              <Steps
                steps={[
                  { label: "Inquiry", meta: "Approved 14 Jun", state: "done" },
                  { label: "Assessment", meta: "52% complete", state: "current" },
                  { label: "Evidence review", meta: "3 items open", state: "todo" },
                  { label: "Decision", meta: "Expected Oct", state: "todo" },
                ]}
              />
            </Card>

            <Card>
              <EmptyState
                action={<Btn size="sm">Find a ministry</Btn>}
                description="When you follow a ministry, its updates, reports and prayer requests appear here."
                title="You are not following anyone yet"
              />
            </Card>
          </div>
        </section>

        {/* --------------------------------------------------------- Spacing */}
        <section>
          <SectionTitle description="A 4px base. Card padding is 24, section rhythm is 72.">
            Spacing, radius and elevation
          </SectionTitle>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-7">
              <p className="save-eyebrow mb-5 text-ink-400">Radius</p>
              <div className="flex flex-wrap gap-4">
                {[
                  { class: "rounded-sm", label: "sm · 6" },
                  { class: "rounded-md", label: "md · 8" },
                  { class: "rounded-lg", label: "lg · 12" },
                  { class: "rounded-xl", label: "xl · 16" },
                  { class: "rounded-2xl", label: "2xl · 20" },
                  { class: "rounded-full", label: "pill" },
                ].map((radius) => (
                  <div key={radius.label}>
                    <div
                      className={`h-16 w-16 border border-hairline bg-ink-100 ${radius.class}`}
                    />
                    <p className="mt-1.5 text-micro uppercase tracking-[0.08em] text-ink-400">
                      {radius.label}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-7">
              <p className="save-eyebrow mb-5 text-ink-400">Elevation</p>
              <div className="flex flex-wrap gap-5">
                {["shadow-e1", "shadow-e2", "shadow-e3", "shadow-e4"].map(
                  (shadow) => (
                    <div key={shadow}>
                      <div
                        className={`h-16 w-24 rounded-lg border border-hairline bg-surface ${shadow}`}
                      />
                      <p className="mt-2 text-micro uppercase tracking-[0.08em] text-ink-400">
                        {shadow.replace("shadow-", "")}
                      </p>
                    </div>
                  ),
                )}
              </div>
              <p className="mt-6 text-caption leading-relaxed text-ink-500">
                Four levels, all warm-tinted and close to the page. Replaces 25
                distinct one-off shadow values in the current codebase.
              </p>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
