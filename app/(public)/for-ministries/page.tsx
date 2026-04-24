import Link from "next/link";

const requirements = [
  "Legally established organization with clear leadership oversight",
  "Public-facing ministry mission and a defined theological position",
  "Basic financial records, including budget history and any applicable 990 or audit materials",
  "Willingness to provide board, governance, and accountability documentation",
  "Readiness to participate in reference checks and follow-up diligence questions",
];

const faqs = [
  {
    answer:
      "Most ministries complete the initial inquiry in about 10 to 15 minutes. The Complete Application takes longer because it includes documents, references, and narrative answers. It is designed to be completed in sections and saved as a draft.",
    question: "How long does the process take?",
  },
  {
    answer:
      "No. SAVE is not a pay-to-play directory. Recommendations are not sold, and every approved brief reflects the same diligence standard regardless of ministry size or visibility.",
    question: "Do ministries pay to receive a recommendation?",
  },
  {
    answer:
      "SAVE reviews leadership, doctrine, governance, finances, external reputation, and measurable ministry fruit. Caution areas are noted directly when they matter for donor trust.",
    question: "What does SAVE evaluate?",
  },
  {
    answer:
      "No. Not every ministry will move from inquiry into the Complete Application. Priority goes to organizations that appear aligned, transparent, and ready for donor-facing diligence.",
    question: "Does every inquiry move into the full application?",
  },
];

const process = [
  {
    copy: "Submit your organization identity, leadership, theological, and financial basics for an initial fit review.",
    title: "1. Initial inquiry",
  },
  {
    copy: "Each inquiry is reviewed for doctrinal alignment, governance readiness, and baseline donor suitability.",
    title: "2. Inquiry review",
  },
  {
    copy: "Approved ministries unlock the full Complete Application with document uploads, narrative responses, and references.",
    title: "3. Deep diligence",
  },
  {
    copy: "A donor-facing brief is published only when the ministry clears review with appropriate confidence.",
    title: "4. Published brief",
  },
];

export default function ForMinistriesPage() {
  return (
    <main className="bg-[#F9F6F0] pt-[68px] text-[#0E2E5C]">
      <section className="bg-[#FEFCF8] px-6 py-20 md:px-[52px] md:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex rounded-full bg-[#E8F0FA] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2A5FA0]">
              For Ministries
            </div>
            <h1 className="font-public-serif mt-6 max-w-[680px] text-[38px] font-medium leading-[1.08] text-[#1A4480] md:text-[62px]">
              A clear diligence process for ministries that welcome scrutiny.
            </h1>
            <p className="mt-6 max-w-[600px] text-[17px] leading-[1.85] text-[#3D5576]">
              SAVE helps serious ministries tell the truth well. Leadership,
              doctrinal, governance, and financial context is gathered so
              supporters can give with confidence.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                className="rounded-[8px] bg-[#1A4480] px-7 py-4 text-[15px] font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#2A5FA0]"
                href="/login?intent=ministry&redirectTo=%2Fportal%2Finquiry"
              >
                Start the inquiry
              </Link>
              <Link
                className="rounded-[8px] border border-[#1A4480] px-7 py-4 text-[15px] font-semibold text-[#1A4480] transition duration-200 hover:bg-[#E8F0FA]"
                href="/about"
              >
                Learn about SAVE
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-[rgba(26,68,128,0.1)] bg-[#0E2E5C] p-8 text-white shadow-[0_20px_60px_rgba(26,68,128,0.14)] md:p-10">
            <div className="grid gap-5 sm:grid-cols-2">
              {[
                ["Inquiry", "10-15 min"],
                ["Application", "8 sections"],
                ["Review model", "100 points"],
                ["Outcome", "Donor brief"],
              ].map(([label, value]) => (
                <div
                  className="rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)] px-5 py-6"
                  key={label}
                >
                  <div className="text-[11px] uppercase tracking-[0.14em] text-[rgba(255,255,255,0.55)]">
                    {label}
                  </div>
                  <div className="font-public-serif mt-2 text-[30px] text-[#F5C842]">
                    {value}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-[14px] leading-[1.8] text-[rgba(255,255,255,0.72)]">
              Strong ministries usually appreciate diligence because it gives
              faithful donors a more truthful basis for generosity.
            </p>
          </div>
        </div>
      </section>

      <section className="py-18 px-6 md:px-[52px] md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-[720px]">
            <div className="inline-flex rounded-full bg-[#FDF5E0] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9A6800]">
              Full Process
            </div>
            <h2 className="font-public-serif mt-5 text-[34px] text-[#1A4480] md:text-[48px]">
              What ministries can expect from beginning to publication.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-4">
            {process.map((step) => (
              <div
                className="rounded-[24px] border border-[rgba(26,68,128,0.1)] bg-white px-6 py-7 shadow-[0_8px_30px_rgba(26,68,128,0.06)]"
                key={step.title}
              >
                <h3 className="font-public-serif text-[22px] text-[#1A4480]">
                  {step.title}
                </h3>
                <p className="mt-4 text-[15px] leading-[1.8] text-[#3D5576]">
                  {step.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-18 bg-[#F0EBE0] px-6 md:px-[52px] md:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <div className="inline-flex rounded-full bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2A5FA0]">
              Application Requirements
            </div>
            <h2 className="font-public-serif mt-5 text-[34px] text-[#1A4480] md:text-[46px]">
              Real substance matters more than polished marketing.
            </h2>
            <p className="mt-5 max-w-[540px] text-[16px] leading-[1.8] text-[#3D5576]">
              The ministries that benefit most from SAVE are ready to show their
              structure, convictions, and stewardship clearly.
            </p>
          </div>

          <div className="rounded-[28px] border border-[rgba(26,68,128,0.1)] bg-white p-8 shadow-[0_14px_40px_rgba(26,68,128,0.08)]">
            <ul className="space-y-4">
              {requirements.map((item) => (
                <li className="flex gap-4" key={item}>
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E8F0FA] text-[12px] font-bold text-[#2A5FA0]">
                    ✓
                  </div>
                  <p className="text-[15px] leading-[1.8] text-[#3D5576]">
                    {item}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-18 px-6 md:px-[52px] md:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <div className="inline-flex rounded-full bg-[#E8F0FA] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2A5FA0]">
              FAQ
            </div>
            <h2 className="font-public-serif mt-5 text-[34px] text-[#1A4480] md:text-[46px]">
              Common questions from ministries.
            </h2>
          </div>

          <div className="mt-10 space-y-4">
            {faqs.map((item) => (
              <details
                className="group rounded-[22px] border border-[rgba(26,68,128,0.1)] bg-white px-6 py-5 shadow-[0_8px_24px_rgba(26,68,128,0.05)]"
                key={item.question}
              >
                <summary className="font-public-serif flex cursor-pointer list-none items-center justify-between gap-4 text-[22px] text-[#1A4480]">
                  {item.question}
                  <span className="text-[#E8A020] transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="pt-4 text-[15px] leading-[1.85] text-[#3D5576]">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-18 bg-[#0E2E5C] px-6 text-white md:px-[52px] md:py-24">
        <div className="mx-auto max-w-5xl rounded-[30px] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)] px-8 py-10 text-center md:px-14 md:py-14">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F5C842]">
            Apply
          </div>
          <h2 className="font-public-serif mt-5 text-[34px] md:text-[50px]">
            Ready to begin the SAVE inquiry?
          </h2>
          <p className="mx-auto mt-5 max-w-[620px] text-[16px] leading-[1.85] text-[rgba(255,255,255,0.75)]">
            If your ministry is prepared for accountability and wants to serve
            donors with unusual clarity, start the inquiry now.
          </p>
          <div className="mt-9">
            <Link
              className="inline-flex rounded-[8px] bg-[#F5C842] px-8 py-4 text-[15px] font-semibold text-[#1A4480] transition duration-200 hover:-translate-y-0.5 hover:bg-[#ffd964]"
              href="/login?intent=ministry&redirectTo=%2Fportal%2Finquiry"
            >
              Apply now
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
