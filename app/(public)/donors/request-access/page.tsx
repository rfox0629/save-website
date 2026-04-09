import { DonorAccessRequestForm } from "@/components/forms/donor-access-request-form";

export default function DonorRequestAccessPage() {
  return (
    <main className="min-h-screen bg-[#F9F6F0] px-6 pb-16 pt-[128px] text-[#1B4D35] md:px-[52px] md:pb-24 md:pt-[148px]">
      <div className="mx-auto max-w-5xl space-y-10">
        <section className="rounded-[32px] border border-[#D8D1C3] bg-[linear-gradient(135deg,#FFFDF8_0%,#F4EFE4_100%)] p-8 shadow-[0_25px_80px_rgba(27,77,53,0.08)] md:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#6B8570]">
            Donor Access
          </p>
          <h1
            className="mt-4 text-4xl leading-tight md:text-[56px]"
            style={{ fontFamily: "var(--font-public-serif)" }}
          >
            Request Donor Access
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[#4F6357]">
            SAVE&apos;s verified ministry briefs are available to serious
            donors by request.
          </p>
        </section>

        <DonorAccessRequestForm />
      </div>
    </main>
  );
}
