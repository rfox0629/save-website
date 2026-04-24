import { DonorNav } from "@/components/donors/donor-nav";
import { DonorHome } from "@/components/dashboard/donor-home";
import { requireDonorBriefs } from "@/lib/donors";

export default async function DonorsPage() {
  const { briefs, canPreview, currentViewMode, userEmail } =
    await requireDonorBriefs();

  return (
    <main className="min-h-screen bg-[#F9F6F0] px-6 py-10 text-[#1A4480]">
      <div className="mx-auto max-w-6xl space-y-8">
        <DonorNav
          canPreview={canPreview}
          currentViewMode={currentViewMode}
          email={userEmail}
        />
        <DonorHome briefs={briefs} />
      </div>
    </main>
  );
}
