import { DonorAccessRequestForm } from "@/components/forms/donor-access-request-form";

export default function DonorRequestAccessPage() {
  return (
    <main className="min-h-screen bg-[#F9F6F0] px-6 py-16 text-[#1B4D35]">
      <div className="mx-auto max-w-4xl space-y-8">
        <section className="rounded-[32px] border border-[#D8D1C3] bg-[linear-gradient(135deg,#FFFDF8_0%,#F4EFE4_100%)] p-8 shadow-[0_25px_80px_rgba(27,77,53,0.08)] md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#6B8570]">
            Donor Access
          </p>
          <h1
            className="mt-4 text-4xl leading-tight md:text-5xl"
            style={{ fontFamily: "var(--font-public-serif)" }}
          >
            Request Donor Access
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[#4F6357]">
            SAVE&apos;s vetted ministry briefs are available to serious donors
            by request.
          </p>
        </section>

        <DonorAccessRequestForm />
      </div>
    </main>
  );
}
