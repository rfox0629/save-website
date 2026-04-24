import Link from "next/link";

import { getCurrentUserRole } from "@/lib/auth";

function HeroWheatBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute right-[18px] top-[54%] hidden h-[900px] w-[670px] -translate-y-1/2 bg-contain bg-right bg-no-repeat opacity-100 md:block lg:right-[30px] lg:h-[960px] lg:w-[710px] xl:right-[44px] xl:h-[1020px] xl:w-[750px]"
      style={{ backgroundImage: "url('/hero-wheat-cropped.png')" }}
    >
      <div className="absolute inset-y-0 left-[-250px] w-[330px] bg-gradient-to-r from-[#FEFCF8] via-[#FEFCF8]/95 to-transparent lg:left-[-230px] lg:w-[310px] xl:left-[-210px] xl:w-[290px]" />
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 inline-flex items-center gap-2 rounded-[20px] bg-[#E8F0FA] px-[14px] py-[6px] text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2A5FA0]">
      {children}
    </div>
  );
}

function HowStep({
  body,
  tag,
  title,
  value,
}: {
  body: string;
  tag: string;
  title: string;
  value: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[rgba(26,68,128,0.1)] bg-white px-9 py-10 transition duration-200 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(26,68,128,0.1)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-[#1A4480]" />
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F0FA]">
        <span className="font-public-serif text-[22px] font-semibold leading-none text-[#1A4480]">
          {value}
        </span>
      </div>
      <h3 className="font-public-serif text-[20px] font-medium text-[#1A4480]">
        {title}
      </h3>
      <p className="mt-3 text-[15px] leading-[1.75] text-[#3D5576]">{body}</p>
      <div className="mt-6 inline-flex items-center gap-1.5 rounded-[20px] bg-[#FDF5E0] px-3 py-[5px] text-[11px] font-semibold uppercase tracking-[0.1em] text-[#E8A020]">
        {tag}
      </div>
    </div>
  );
}

function ModelCell({
  points,
  title,
  body,
}: {
  body: string;
  points: string;
  title: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[14px] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.07)] px-7 py-8 transition duration-200 hover:-translate-y-0.5 hover:bg-[rgba(255,255,255,0.12)]">
      <span className="absolute right-6 top-5 rounded-[20px] bg-[rgba(245,200,66,0.15)] px-2.5 py-[3px] font-mono text-[11px] font-medium tracking-[0.05em] text-[#F5C842]">
        {points}
      </span>
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[10px] bg-[rgba(245,200,66,0.15)]">
        <div className="h-2.5 w-2.5 rounded-full bg-[#F5C842]" />
      </div>
      <h3 className="text-[16px] font-semibold text-white">{title}</h3>
      <p className="mt-2 text-[13px] leading-[1.65] text-[rgba(255,255,255,0.55)]">
        {body}
      </p>
    </div>
  );
}

function ProcessStep({
  description,
  label,
  status,
  statusTone,
  value,
}: {
  description: string;
  label: string;
  status: string;
  statusTone: "amber" | "green";
  value: string;
}) {
  return (
    <div className="relative flex gap-6 py-6">
      <div
        className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 font-mono text-[13px] font-medium transition-colors ${
          statusTone === "green"
            ? "border-[#1A4480] bg-white text-[#1A4480]"
            : "border-[#1A4480] bg-white text-[#1A4480]"
        }`}
      >
        {value}
      </div>
      <div className="flex-1 rounded-[14px] border border-[rgba(26,68,128,0.1)] bg-white px-6 py-5 transition duration-200 hover:translate-x-1 hover:shadow-[0_4px_24px_rgba(26,68,128,0.08)]">
        <h4 className="text-[16px] font-semibold text-[#1A4480]">{label}</h4>
        <p className="mt-1.5 text-[14px] leading-[1.65] text-[#7088A5]">
          {description}
        </p>
        <span
          className={`mt-2.5 inline-flex items-center gap-[5px] rounded-[20px] border px-[10px] py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
            statusTone === "green"
              ? "border-[rgba(27,107,58,0.2)] bg-[#E5F4EC] text-[#1B6B3A]"
              : "border-[rgba(232,160,32,0.25)] bg-[#FDF5E0] text-[#9A6800]"
          }`}
        >
          ● {status}
        </span>
      </div>
    </div>
  );
}

export default async function PublicHomePage() {
  const { role } = await getCurrentUserRole();
  const ministryHref = role === "ministry" ? "/portal/inquiry" : "/register";
  const donorExploreHref =
    role === "donor" ? "/donors" : "/donors/request-access";
  const donorRequestHref = "/donors/request-access";
  const leadershipAlignment = {
    alignmentInsight:
      "Internal and external perspectives reflect a consistent view of leadership character, communication, and organizational posture.",
    externalPerspective:
      "Outside perspectives describe leadership as credible, steady, and broadly consistent with the ministry's public posture.",
    internalPerspective:
      "Internal perspectives describe leadership as clear, relational, and consistent in day-to-day culture and direction.",
    status: "Aligned" as const,
  };

  return (
    <main className="overflow-hidden bg-[#F9F6F0] pt-[68px]">
      <section className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-[#FEFCF8] px-6 pb-20 pt-[130px] md:px-[52px] md:pb-20">
        <HeroWheatBackground />

        <div className="relative z-10 max-w-[720px]">
          <div className="mb-7 inline-flex items-center gap-[10px] text-[12px] font-semibold uppercase tracking-[0.18em] text-[#2A5FA0]">
            <div className="h-1.5 w-1.5 rounded-full bg-[#E8A020]" />
            Trusted Kingdom Giving
          </div>

          <h1 className="font-public-serif text-[40px] font-medium leading-[1.1] tracking-[-0.025em] text-[#1A4480] md:text-[72px]">
            Give with clarity.
            <br />
            Give with{" "}
            <span className="relative inline-block italic text-[#3E6FB6]">
              conviction.
              <span className="absolute inset-x-0 bottom-1 h-[3px] rounded-[2px] bg-[#E5B94E]" />
            </span>
          </h1>

          <p className="mt-7 max-w-[520px] text-[18px] leading-[1.75] text-[#3D5576]">
            The SAVE Standard brings clarity to Kingdom giving so business
            leaders and major donors can support Christian ministries with
            confidence, accountability, and joy.
          </p>

          <div className="mt-11 flex flex-wrap gap-[14px]">
            <Link
              className="inline-block rounded-[8px] bg-[#1A4480] px-[34px] py-[15px] text-[15px] font-semibold tracking-[0.01em] text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#2A5FA0]"
              href={ministryHref}
            >
              Apply as a Ministry
            </Link>
            <Link
              className="inline-block rounded-[8px] border border-[#1A4480] bg-transparent px-[34px] py-[15px] text-[15px] font-semibold tracking-[0.01em] text-[#1A4480] transition duration-200 hover:-translate-y-0.5 hover:bg-[#E8F0FA]"
              href={donorRequestHref}
            >
              Request Donor Access →
            </Link>
          </div>
        </div>

        <div className="absolute bottom-[72px] right-6 hidden gap-5 lg:flex xl:right-[52px] xl:gap-10">
          {[
            ["100", "Point model"],
            ["6", "Core categories"],
            ["8+", "Data sources"],
          ].map(([value, label]) => (
            <div
              className="rounded-xl border border-[rgba(26,68,128,0.1)] bg-white px-5 py-4 text-center shadow-[0_4px_24px_rgba(26,68,128,0.07)] xl:px-6 xl:py-5"
              key={label}
            >
              <span className="font-public-serif block text-[32px] font-semibold leading-none text-[#1A4480] xl:text-[36px]">
                {value}
              </span>
              <span className="mt-[5px] block text-[10px] font-medium uppercase tracking-[0.1em] text-[#7088A5] xl:text-[11px]">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="flex gap-12 overflow-x-auto bg-[#0E2E5C] px-6 py-5 md:px-[52px]">
        <span className="shrink-0 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.2em] text-[#F5C842]">
          The SAVE Standard includes
        </span>
        <div className="h-5 w-px shrink-0 bg-[rgba(255,255,255,0.2)]" />
        {[
          "IRS TEOS Verification",
          "Form 990 Review",
          "Leadership Assessment",
          "Governance Audit",
          "Doctrinal Review",
          "Reference Checks",
          "Charity Navigator",
          "Reputation Search",
        ].map((item) => (
          <div
            className="flex shrink-0 items-center gap-2 whitespace-nowrap text-[13px] font-medium text-[rgba(255,255,255,0.85)]"
            key={item}
          >
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[rgba(245,200,66,0.2)] text-[9px] font-bold text-[#F5C842]">
              ✓
            </div>
            {item}
          </div>
        ))}
      </div>

      <section
        className="bg-[#F0EBE0] px-6 py-16 md:px-[52px] md:py-24"
        id="how"
      >
        <SectionLabel>Process</SectionLabel>
        <h2 className="font-public-serif max-w-[640px] text-[32px] font-medium leading-[1.15] text-[#1A4480] md:text-[48px]">
          Four steps. <em>No shortcuts.</em>
        </h2>
        <p className="mt-5 max-w-[540px] text-[16px] leading-[1.8] text-[#3D5576]">
          Every ministry presented through the SAVE Standard has gone through
          the same clear and consistent evaluation. No exceptions. No
          shortcuts. No pay-to-play.
        </p>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          <HowStep
            body="Ministries submit a detailed application covering leadership, doctrine, governance, and finances. Not a contact form. A clear evaluation that surfaces what matters."
            tag="10–15 minutes"
            title="Structured Inquiry"
            value="01"
          />
          <HowStep
            body="Financial records, governance documents, doctrinal statements, external reputation, and references are reviewed against a structured model across six weighted categories."
            tag="30–45 minutes"
            title="Comprehensive Evaluation"
            value="02"
          />
          <HowStep
            body="Every approved ministry receives a published ministry brief. Concise. Honest. Specific. Read it. Decide with confidence."
            tag="Published report"
            title="Donor-Ready Brief"
            value="03"
          />
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-l-[4px] border-[rgba(26,68,128,0.1)] border-l-[#E8A020] bg-white transition duration-200 hover:shadow-[0_12px_40px_rgba(26,68,128,0.09)]">
          <div className="grid md:grid-cols-[1fr_1px_340px]">
            <div className="px-7 py-9 md:px-12 md:py-11">
              <div className="mb-5 flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(232,160,32,0.12)]">
                  <span className="font-public-serif text-[22px] font-semibold leading-none text-[#E8A020]">
                    04
                  </span>
                </div>
                <span className="rounded-[20px] border border-[rgba(232,160,32,0.3)] bg-[#FDF5E0] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#9A6800]">
                  Select organizations only
                </span>
              </div>
              <h3 className="font-public-serif text-[26px] font-medium text-[#1A4480]">
                Relational Discernment
              </h3>
              <p className="mb-4 mt-2 text-[16px] font-medium leading-[1.5] text-[#2A5FA0]">
                Evaluation goes beyond documents. Leadership is seen up close.
              </p>
              <p className="mb-5 text-[14px] leading-[1.8] text-[#3D5576]">
                Documents reveal structure. Conversations reveal intention.
                Proximity reveals character. The most important things about a
                leader cannot be captured in a form or an interview. For select
                organizations, the SAVE Standard includes time in proximity
                with ministry leadership, observing the consistency between
                what is presented and what is lived.
              </p>
              <div className="mb-5 rounded-[8px] border-l-[3px] border-l-[#1A4480] bg-[#E8F0FA] px-[18px] py-[14px] text-[13px] leading-[1.7] text-[#7088A5]">
                This step is mutual and invitational. It is never entered
                without the ministry&apos;s full knowledge and consent. It is
                reserved for organizations being considered for significant
                giving relationships. It is a mark of trust, not suspicion.
              </div>
              {leadershipAlignment ? (
                <div className="mb-5 rounded-[18px] border border-[rgba(26,68,128,0.1)] bg-[#FCFAF5] px-5 py-5">
                  <div className="mb-4 flex flex-wrap items-center gap-2.5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#2A5FA0]">
                      Leadership Alignment
                    </p>
                    <span className="rounded-[20px] border border-[rgba(26,68,128,0.12)] bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7088A5]">
                      {leadershipAlignment.status}
                    </span>
                  </div>
                  <p className="mb-5 text-[13px] leading-[1.7] text-[#7088A5]">
                    Clarity is strengthened when internal and external
                    perspectives align.
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-[14px] border border-[rgba(26,68,128,0.08)] bg-white px-4 py-4">
                      <p className="text-[12px] font-semibold text-[#1A4480]">
                        Internal Perspective
                      </p>
                      <p className="mt-1.5 text-[13px] leading-[1.7] text-[#7088A5]">
                        Insights gathered from those within the organization.
                      </p>
                      <p className="mt-3 text-[13px] leading-[1.7] text-[#3D5576]">
                        {leadershipAlignment.internalPerspective}
                      </p>
                    </div>
                    <div className="rounded-[14px] border border-[rgba(26,68,128,0.08)] bg-white px-4 py-4">
                      <p className="text-[12px] font-semibold text-[#1A4480]">
                        External Perspective
                      </p>
                      <p className="mt-1.5 text-[13px] leading-[1.7] text-[#7088A5]">
                        Insights gathered from partners and those outside the
                        organization.
                      </p>
                      <p className="mt-3 text-[13px] leading-[1.7] text-[#3D5576]">
                        {leadershipAlignment.externalPerspective}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-[14px] border border-[rgba(26,68,128,0.08)] bg-white px-4 py-4">
                    <p className="text-[12px] font-semibold text-[#1A4480]">
                      Alignment Insight
                    </p>
                    <p className="mt-1.5 text-[13px] leading-[1.7] text-[#7088A5]">
                      A summarized view of how closely internal and external
                      perspectives align.
                    </p>
                    <p className="mt-3 text-[13px] leading-[1.7] text-[#3D5576]">
                      {leadershipAlignment.alignmentInsight}
                    </p>
                  </div>
                </div>
              ) : null}
              <p className="text-[14px] leading-[1.6] text-[#3D5576]">
                <em>
                  Integrity is not proven in presentation. It is confirmed in
                  consistency, over time, in proximity, in the ordinary.
                </em>
              </p>
            </div>

            <div className="mx-10 hidden bg-[rgba(26,68,128,0.1)] md:block" />

            <div className="px-7 py-8 md:px-10 md:py-11">
              <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#2A5FA0]">
                What this includes
              </p>
              <ul className="space-y-3.5">
                {[
                  "Time spent in person with ministry leadership",
                  "Shared meals and unstructured conversation",
                  "Observation of leadership rhythms and team culture",
                  "Relational interaction outside formal or prepared settings",
                  "Conversations with those closest to the leader",
                ].map((item) => (
                  <li
                    className="flex items-start gap-3 text-[14px] leading-[1.55] text-[#3D5576]"
                    key={item}
                  >
                    <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#E8A020]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section
        className="grid gap-10 bg-[#FEFCF8] px-6 py-16 md:grid-cols-2 md:gap-20 md:px-[52px] md:py-24"
        id="why"
      >
        <div>
          <SectionLabel>Why it matters</SectionLabel>
          <h2 className="font-public-serif max-w-[640px] text-[32px] font-medium leading-[1.15] text-[#1A4480] md:text-[48px]">
            Discernment is not doubt.
            <br />
            <em>It is wisdom.</em>
          </h2>
          <p className="mt-5 max-w-[540px] text-[16px] leading-[1.8] text-[#3D5576]">
            Billions of dollars flow to Christian ministries every year. Very
            little of it is clearly understood. Most donors give based on
            relationship,
            reputation, or a compelling story.
          </p>
          <p className="mt-4 max-w-[540px] text-[16px] leading-[1.8] text-[#3D5576]">
            Those are not bad starting points. But they are not enough.
          </p>

          <div className="mt-9 space-y-5">
            {[
              [
                "Asking hard questions is an act of love.",
                "The organizations you fund represent your values. The SAVE Standard strengthens alignment between donor and mission.",
              ],
              [
                "Accountability protects the mission.",
                "Healthy ministries welcome accountability. The SAVE Standard is a spiritual discipline in practice.",
              ],
              [
                "Fruit requires roots.",
                "Governance, doctrine, and character matter as much as outcomes. Unsustainable ministries waste generosity.",
              ],
            ].map(([title, body]) => (
              <div
                className="flex items-start gap-4 rounded-xl border border-[rgba(26,68,128,0.1)] bg-[#E8F0FA] p-5 transition duration-200 hover:translate-x-1"
                key={title}
              >
                <div className="mt-px flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[#1A4480] text-[#F5C842]">
                  ✓
                </div>
                <div className="text-[14px] leading-[1.7] text-[#3D5576]">
                  <strong className="mb-1 block text-[15px] font-semibold text-[#1A4480]">
                    {title}
                  </strong>
                  {body}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-[rgba(26,68,128,0.2)] pt-10 md:border-l md:border-t-0 md:pl-[60px] md:pt-0">
          <blockquote className="font-public-serif mb-4 border-l-[3px] border-l-[#E8A020] pl-5 text-[22px] italic leading-[1.5] text-[#1A4480]">
            &quot;Faithful stewardship starts with honest information, about
            the mission, the leadership, and the evidence of lasting
            fruit.&quot;
          </blockquote>
          <p className="mb-11 pl-5 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#7088A5]">
            SAVE Foundation
          </p>

          <div className="rounded-2xl border border-[rgba(232,160,32,0.25)] bg-[#FDF5E0] p-7">
            <div className="mb-2.5 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.15em] text-[#E8A020]">
              <span className="inline-block h-[14px] w-[14px] rotate-45 bg-[#E8A020]" />
              Our independence guarantee
            </div>
            <p className="text-[14px] leading-[1.7] text-[#3D5576]">
              No ministry pays to be recommended. No brief is issued without
              human review. Every recommendation reflects the data,
              nothing else.
            </p>
          </div>
        </div>
      </section>

      <section
        className="bg-[#0E2E5C] px-6 py-16 md:px-[52px] md:py-24"
        id="model"
      >
        <div className="mb-6 inline-flex items-center gap-2 rounded-[20px] bg-[rgba(255,255,255,0.12)] px-[14px] py-[6px] text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F5C842]">
          The model
        </div>
        <h2 className="font-public-serif max-w-[640px] text-[32px] font-medium leading-[1.15] text-white md:text-[48px]">
          A 100-point framework built on <em>what actually matters.</em>
        </h2>
        <p className="mt-5 max-w-[540px] text-[16px] leading-[1.8] text-[rgba(255,255,255,0.65)]">
          Six weighted categories. Clear subcriteria. Defined flag triggers.
          Consistent disqualifiers. Nothing arbitrary.
        </p>

        <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <ModelCell
            body="Accountability structure, board independence, decision model, personal character and stability."
            points="20 pts"
            title="Leadership Integrity"
          />
          <ModelCell
            body="Gospel clarity, Scripture position, public doctrinal statement, staff affirmation requirements."
            points="15 pts"
            title="Doctrine"
          />
          <ModelCell
            body="Board independence, meeting frequency, conflict-of-interest policy, whistleblower protections."
            points="15 pts"
            title="Governance"
          />
          <ModelCell
            body="Financial review level, program expense ratio, reserve fund, restricted fund clarity and transparency."
            points="20 pts"
            title="Financial Stewardship"
          />
          <ModelCell
            body="Scale of impact, clarity of mission, spiritual fruit, and external validation where applicable."
            points="20 pts"
            title="Fruit"
          />
          <ModelCell
            body="ECFA membership, reference quality, IRS standing, and public reputation."
            points="10 pts"
            title="External Trust"
          />
        </div>

        <div className="mt-9 flex flex-wrap gap-6">
          {[
            ["#3B7AC2", "85–100 Strongly recommended"],
            ["#7FB3E8", "70–84 Recommended"],
            ["#D4A520", "55–69 Conditional"],
            ["#C0392B", "Below 55 Not recommended"],
          ].map(([color, label]) => (
            <div
              className="flex items-center gap-2 text-[13px] text-[rgba(255,255,255,0.7)]"
              key={label}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              {label}
            </div>
          ))}
        </div>
      </section>

      <section className="grid xl:grid-cols-2" id="audience">
        <div className="border-b border-[rgba(26,68,128,0.1)] bg-[#E8F0FA] px-6 py-[56px] md:px-16 md:py-[88px] xl:border-b-0 xl:border-r">
          <div className="mb-7 inline-flex items-center gap-2 rounded-[20px] border-[1.5px] border-[rgba(26,68,128,0.2)] bg-white px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#1A4480]">
            For Ministries
          </div>
          <h2 className="font-public-serif text-[32px] font-medium leading-[1.2] text-[#1A4480]">
            If your work is real,
            <br />
            you have nothing to <em>fear.</em>
          </h2>
          <p className="mb-8 mt-4 max-w-[400px] text-[15px] leading-[1.8] text-[#3D5576]">
            The SAVE Standard gives your ministry credibility with serious
            donors. It signals accountability. It connects you to givers
            aligned with what you have built.
          </p>
          <ul className="mb-10 space-y-2.5">
            {[
              "Inquiry reviewed within 5 business days",
              "Complete Application unlocked after approval",
              "Secure document upload portal",
              "Published ministry brief upon approval",
              "Annual evaluation required to maintain active status",
            ].map((item) => (
              <li
                className="flex items-start gap-2.5 rounded-[10px] border border-[rgba(26,68,128,0.1)] bg-white px-4 py-3 text-[14px] leading-[1.5] text-[#3D5576]"
                key={item}
              >
                <div className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#1A4480] bg-[#E8F0FA] text-[10px] text-[#1A4480]">
                  ✓
                </div>
                {item}
              </li>
            ))}
          </ul>
          <Link
            className="inline-block rounded-[8px] bg-[#1A4480] px-[34px] py-[15px] text-[15px] font-semibold tracking-[0.01em] text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#2A5FA0]"
            href="/portal/inquiry"
          >
            Begin Your Application →
          </Link>
        </div>

        <div className="bg-[#FDF5E0] px-6 py-[56px] md:px-16 md:py-[88px]">
          <div className="mb-7 inline-flex items-center gap-2 rounded-[20px] border-[1.5px] border-[rgba(26,68,128,0.2)] bg-white px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#1A4480]">
            For Donors
          </div>
          <h2 className="font-public-serif text-[32px] font-medium leading-[1.2] text-[#1A4480]">
            Give with confidence.
            <br />
            Give with <em>conviction.</em>
          </h2>
          <p className="mb-8 mt-4 max-w-[400px] text-[15px] leading-[1.8] text-[#3D5576]">
            You&apos;ve built something. You want it to matter beyond your
            lifetime. The SAVE Standard brings clarity and documents every
            step.
          </p>
          <ul className="mb-10 space-y-2.5">
            {[
              "Access to all published ministry briefs",
              "Honest commendations and cautions",
              "Full evaluation summary, what was included",
              "Recommendation level in plain language",
              "Direct connection to ministry leadership",
            ].map((item) => (
              <li
                className="flex items-start gap-2.5 rounded-[10px] border border-[rgba(26,68,128,0.1)] bg-white px-4 py-3 text-[14px] leading-[1.5] text-[#3D5576]"
                key={item}
              >
                <div className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#E8A020] bg-[#FDF5E0] text-[10px] text-[#9A6800]">
                  ✓
                </div>
                {item}
              </li>
            ))}
          </ul>
          <Link
            className="inline-block rounded-[8px] border border-[#1A4480] bg-transparent px-[34px] py-[15px] text-[15px] font-semibold tracking-[0.01em] text-[#1A4480] transition duration-200 hover:-translate-y-0.5 hover:bg-[#E8F0FA]"
            href={donorExploreHref}
          >
            Explore Verified Ministries →
          </Link>
        </div>
      </section>

      <section
        className="bg-[#F0EBE0] px-6 py-16 md:px-[52px] md:py-24"
        id="process"
      >
        <SectionLabel>Timeline</SectionLabel>
        <h2 className="font-public-serif text-[32px] font-medium leading-[1.15] text-[#1A4480] md:text-[48px]">
          From inquiry to
          <br />
          <em>funded ministry.</em>
        </h2>

        <div className="relative mt-14 max-w-[680px]">
          <div className="absolute bottom-12 left-[23px] top-12 w-0.5 rounded-[2px] bg-[linear-gradient(to_bottom,#1A4480_0%,#E8F0FA_100%)]" />
          <ProcessStep
            description="Structured 10–15 minute application. Leadership, doctrine, and financials at a surface level."
            label="Ministry submits inquiry"
            status="Submitted"
            statusTone="green"
            value="01"
          />
          <ProcessStep
            description="Admin reviews for completeness and early red flags. Decision within 5 business days."
            label="SAVE reviews inquiry"
            status="Under review"
            statusTone="amber"
            value="02"
          />
          <ProcessStep
            description="30–45 minute deep dive with document upload. Six full categories of structured review."
            label="Complete Application unlocked"
            status="Vetting in progress"
            statusTone="green"
            value="03"
          />
          <ProcessStep
            description="100-point model calculates automatically. Risk flags generated. External checks completed."
            label="Scoring engine runs"
            status="Scoring complete"
            statusTone="amber"
            value="04"
          />
          <ProcessStep
            description="Reviewer reads documents, contacts references, runs external checks, and writes recommendation."
            label="Human reviewer completes diligence"
            status="Review complete"
            statusTone="amber"
            value="05"
          />
          <ProcessStep
            description="A concise, honest brief goes live. Commendations, cautions, recommendation, and diligence checklist."
            label="Donor brief published"
            status="Brief published"
            statusTone="green"
            value="06"
          />
        </div>
      </section>

      <section
        className="relative overflow-hidden bg-[#FEFCF8] px-6 py-[120px] text-center md:px-[52px]"
        id="cta"
      >
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E8F0FA] opacity-50" />
        <div className="relative z-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-[20px] bg-[#E8F0FA] px-[14px] py-[6px] text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2A5FA0]">
            Get started
          </div>
          <h2 className="font-public-serif mx-auto max-w-[760px] text-[32px] font-medium leading-[1.15] text-[#1A4480] md:text-[48px]">
            Faithful generosity starts with
            <br />
            <em>honest information.</em>
          </h2>
          <p className="mx-auto mt-4 max-w-[540px] text-[16px] leading-[1.8] text-[#3D5576]">
            Ministries ready for accountability and donors ready to give with
            confidence begin here.
          </p>
          <div className="relative mb-9 mt-11 flex flex-wrap justify-center gap-4">
            <Link
              className="inline-block rounded-[8px] bg-[#1A4480] px-[34px] py-[15px] text-[15px] font-semibold tracking-[0.01em] text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#2A5FA0]"
              href={ministryHref}
            >
              Apply as a Ministry
            </Link>
            <Link
              className="inline-block rounded-[8px] border border-[#1A4480] bg-transparent px-[34px] py-[15px] text-[15px] font-semibold tracking-[0.01em] text-[#1A4480] transition duration-200 hover:-translate-y-0.5 hover:bg-[#E8F0FA]"
              href={donorRequestHref}
            >
              Request Donor Access →
            </Link>
          </div>
          <p className="relative text-[12px] font-medium tracking-[0.06em] text-[#7088A5]">
            No ministry pays to be recommended. All briefs include human
            review. Annual evaluation required.
          </p>
        </div>
      </section>
    </main>
  );
}
