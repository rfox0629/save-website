import Link from "next/link";

const values = [
  {
    body: "We believe donors should not have to guess about doctrine, governance, or stewardship before writing meaningful checks.",
    title: "Clarity",
  },
  {
    body: "We use one diligence standard across ministries because trust collapses when standards move with influence or proximity.",
    title: "Consistency",
  },
  {
    body: "We aim to tell the truth in ways that serve both donors and ministries rather than flattering either side.",
    title: "Courage",
  },
];

export default function AboutPage() {
  return (
    <main className="bg-[#F9F6F0] pt-[68px] text-[#1A2E20]">
      <section className="bg-[#FEFCF8] px-6 py-20 md:px-[52px] md:py-24">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex rounded-full bg-[#EBF5EF] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#236645]">
            About SAVE
          </div>
          <h1 className="font-public-serif mx-auto mt-6 max-w-[820px] text-[38px] font-medium leading-[1.08] text-[#1B4D35] md:text-[62px]">
            We exist to strengthen Christian generosity with disciplined
            diligence.
          </h1>
          <p className="mx-auto mt-6 max-w-[700px] text-[17px] leading-[1.9] text-[#3D5C47]">
            SAVE was built to help serious donors support serious ministries
            with more confidence. Our work sits between instinct and blind
            trust, giving philanthropists a clearer basis for discernment.
          </p>
        </div>
      </section>

      <section className="py-18 px-6 md:px-[52px] md:py-24">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[30px] border border-[rgba(27,77,53,0.1)] bg-white p-8 shadow-[0_14px_40px_rgba(27,77,53,0.08)] md:p-10">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#236645]">
              Mission
            </div>
            <h2 className="font-public-serif mt-4 text-[34px] text-[#1B4D35]">
              Build trust where generosity and accountability meet.
            </h2>
            <p className="mt-5 text-[16px] leading-[1.9] text-[#3D5C47]">
              Our mission is to help donors fund kingdom work with both
              conviction and care. We want excellent ministries to be easier to
              recognize and easier to support because their structure, doctrine,
              and stewardship have been examined honestly.
            </p>
          </div>

          <div className="rounded-[30px] border border-[rgba(27,77,53,0.1)] bg-[#1B4D35] p-8 text-white shadow-[0_14px_40px_rgba(27,77,53,0.12)] md:p-10">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F5C842]">
              Methodology
            </div>
            <h2 className="font-public-serif mt-4 text-[34px]">
              A structured model, not a personal hunch.
            </h2>
            <p className="mt-5 text-[16px] leading-[1.9] text-[rgba(255,255,255,0.76)]">
              SAVE reviews ministries through a weighted model that examines
              leadership, doctrine, governance, finances, fruit, and external
              trust indicators. Documents, narrative responses, reputation
              checks, and reviewer judgment all contribute to the final picture.
            </p>
          </div>
        </div>
      </section>

      <section className="py-18 bg-[#F0EBE0] px-6 md:px-[52px] md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-[700px]">
            <div className="inline-flex rounded-full bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#236645]">
              Values
            </div>
            <h2 className="font-public-serif mt-5 text-[34px] text-[#1B4D35] md:text-[48px]">
              The convictions behind the platform.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {values.map((item) => (
              <div
                className="rounded-[24px] border border-[rgba(27,77,53,0.1)] bg-white px-6 py-7 shadow-[0_8px_28px_rgba(27,77,53,0.06)]"
                key={item.title}
              >
                <h3 className="font-public-serif text-[26px] text-[#1B4D35]">
                  {item.title}
                </h3>
                <p className="mt-4 text-[15px] leading-[1.85] text-[#3D5C47]">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-18 px-6 md:px-[52px] md:py-24">
        <div className="mx-auto max-w-5xl rounded-[30px] border border-[rgba(27,77,53,0.1)] bg-white px-8 py-10 shadow-[0_14px_40px_rgba(27,77,53,0.08)] md:px-14 md:py-14">
          <div className="grid gap-10 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#236645]">
                Next Step
              </div>
              <h2 className="font-public-serif mt-4 text-[34px] text-[#1B4D35] md:text-[46px]">
                Explore the process from either side of the table.
              </h2>
              <p className="mt-4 max-w-[620px] text-[16px] leading-[1.85] text-[#3D5C47]">
                Ministries can begin the inquiry today, and donors can learn how
                SAVE briefs support more thoughtful giving decisions.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                className="rounded-[8px] bg-[#1B4D35] px-7 py-4 text-[15px] font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#236645]"
                href="/login?intent=ministry&redirectTo=%2Fportal%2Finquiry"
              >
                For ministries
              </Link>
              <Link
                className="rounded-[8px] border border-[#1B4D35] px-7 py-4 text-[15px] font-semibold text-[#1B4D35] transition duration-200 hover:bg-[#EBF5EF]"
                href="/for-donors"
              >
                For donors
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
