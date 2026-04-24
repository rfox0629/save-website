import Link from "next/link";

const inclusions = [
  "Leadership, doctrine, governance, and financial stewardship",
  "External reputation and reference validation",
  "Clear commendations and donor awareness notes",
  "A recommendation level with concise rationale",
];

const trustSignals = [
  "Structured 100-point evaluation model",
  "No pay-to-play recommendations",
  "Documented evaluation process",
  "Public-facing briefs designed for decision-makers",
];

export default function ForDonorsPage() {
  return (
    <main className="bg-[#F9F6F0] pt-[68px] text-[#0E2E5C]">
      <section className="bg-[#FEFCF8] px-6 py-20 md:px-[52px] md:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="inline-flex rounded-full bg-[#FDF5E0] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9A6800]">
              For Donors
            </div>
            <h1 className="font-public-serif mt-6 max-w-[700px] text-[38px] font-medium leading-[1.08] text-[#1A4480] md:text-[62px]">
              Serious giving deserves more than a glossy pitch deck.
            </h1>
            <p className="mt-6 max-w-[600px] text-[17px] leading-[1.85] text-[#3D5576]">
              SAVE briefs help donors move faster with better information. Each
              brief turns evaluation into a concise, donor-ready document that
              surfaces what matters without burying you in noise.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                className="rounded-[8px] bg-[#1A4480] px-7 py-4 text-[15px] font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#2A5FA0]"
                href="/login?intent=donor"
              >
                Request access
              </Link>
              <Link
                className="rounded-[8px] border border-[#1A4480] px-7 py-4 text-[15px] font-semibold text-[#1A4480] transition duration-200 hover:bg-[#E8F0FA]"
                href="/about"
              >
                Learn about SAVE
              </Link>
            </div>
          </div>

          <div className="rounded-[30px] border border-[rgba(26,68,128,0.1)] bg-white p-8 shadow-[0_16px_45px_rgba(26,68,128,0.08)] md:p-10">
            <div className="border-b border-[rgba(26,68,128,0.08)] pb-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2A5FA0]">
                SAVE Brief
              </div>
              <h2 className="font-public-serif mt-3 text-[30px] text-[#1A4480]">
                A one-page ministry snapshot.
              </h2>
            </div>
            <div className="space-y-4 py-6">
              {inclusions.map((item) => (
                <div className="flex gap-4" key={item}>
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E8F0FA] text-[12px] font-bold text-[#2A5FA0]">
                    ✓
                  </div>
                  <p className="text-[15px] leading-[1.75] text-[#3D5576]">
                    {item}
                  </p>
                </div>
              ))}
            </div>
            <div className="rounded-[22px] bg-[#0E2E5C] px-6 py-6 text-white">
              <div className="text-[11px] uppercase tracking-[0.16em] text-[#F5C842]">
                Outcome
              </div>
              <p className="mt-3 text-[15px] leading-[1.8] text-[rgba(255,255,255,0.76)]">
                You get a fast read on whether a ministry is trustworthy,
                well governed, and strategically compelling before deeper
                philanthropic conversations begin.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-18 px-6 md:px-[52px] md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-[720px]">
            <div className="inline-flex rounded-full bg-[#E8F0FA] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2A5FA0]">
              How Briefs Work
            </div>
            <h2 className="font-public-serif mt-5 text-[34px] text-[#1A4480] md:text-[48px]">
              Structured evaluation. Sharper decisions.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              [
                "1. Ministry submits information",
                "An organization completes inquiry, shares documents, and provides the information needed for evaluation.",
              ],
              [
                "2. The SAVE Standard evaluates",
                "Each ministry is evaluated across leadership, doctrine, governance, financial stewardship, fruit, and external trust.",
              ],
              [
                "3. Ministry brief is published",
                "Approved organizations receive a concise brief designed for donors, advisors, and family office decision-makers.",
              ],
            ].map(([title, body]) => (
              <div
                className="rounded-[24px] border border-[rgba(26,68,128,0.1)] bg-white px-6 py-7 shadow-[0_8px_28px_rgba(26,68,128,0.06)]"
                key={title}
              >
                <h3 className="font-public-serif text-[24px] text-[#1A4480]">
                  {title}
                </h3>
                <p className="mt-4 text-[15px] leading-[1.8] text-[#3D5576]">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-18 bg-[#F0EBE0] px-6 md:px-[52px] md:py-24">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
          <div className="rounded-[28px] border border-[rgba(26,68,128,0.1)] bg-white p-8 shadow-[0_14px_40px_rgba(26,68,128,0.08)]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2A5FA0]">
              What&apos;s Included
            </div>
            <h2 className="font-public-serif mt-4 text-[34px] text-[#1A4480]">
              Briefs are built for clarity, not clutter.
            </h2>
            <ul className="mt-6 space-y-4">
              {inclusions.map((item) => (
                <li className="flex gap-4" key={item}>
                  <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#E8A020]" />
                  <p className="text-[15px] leading-[1.8] text-[#3D5576]">
                    {item}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[28px] border border-[rgba(26,68,128,0.1)] bg-[#0E2E5C] p-8 text-white shadow-[0_14px_40px_rgba(26,68,128,0.12)]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F5C842]">
              Trust Signals
            </div>
            <h2 className="font-public-serif mt-4 text-[34px]">
              Confidence comes from method, not mood.
            </h2>
            <ul className="mt-6 space-y-4">
              {trustSignals.map((item) => (
                <li className="flex gap-4" key={item}>
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[rgba(245,200,66,0.15)] text-[12px] font-bold text-[#F5C842]">
                    ✓
                  </div>
                  <p className="text-[15px] leading-[1.8] text-[rgba(255,255,255,0.76)]">
                    {item}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-18 bg-[#0E2E5C] px-6 text-white md:px-[52px] md:py-24">
        <div className="mx-auto max-w-5xl text-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F5C842]">
            Request Access
          </div>
          <h2 className="font-public-serif mt-5 text-[34px] md:text-[50px]">
            Want donor access to published SAVE briefs?
          </h2>
          <p className="mx-auto mt-5 max-w-[640px] text-[16px] leading-[1.85] text-[rgba(255,255,255,0.74)]">
            Request access to the donor portal for current briefs, evaluation
            summaries, and ministries aligned with serious giving.
          </p>
          <div className="mt-9">
            <Link
              className="inline-flex rounded-[8px] bg-[#F5C842] px-8 py-4 text-[15px] font-semibold text-[#1A4480] transition duration-200 hover:-translate-y-0.5 hover:bg-[#ffd964]"
              href="/login?intent=donor"
            >
              Request access
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
