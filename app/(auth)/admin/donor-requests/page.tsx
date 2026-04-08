import Link from "next/link";

import { getDonorRequests } from "@/app/actions/donor-requests";
import { AdminDonorRequestsTable } from "@/components/dashboard/admin-donor-requests-table";

export default async function AdminDonorRequestsPage() {
  const requests = await getDonorRequests();

  return (
    <main className="min-h-screen bg-[#0B1622] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(192,154,69,0.18),rgba(11,22,34,0.2)_35%,rgba(76,125,155,0.16))] p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#C09A45]">
                Admin
              </p>
              <h1 className="mt-4 text-3xl font-semibold">
                Donor access requests
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-300">
                Review inbound donor access requests, invite approved donors,
                and keep the directory limited to verified recipients.
              </p>
            </div>

            <Link
              className="text-sm font-medium text-[#F4E3B2] hover:text-white"
              href="/dashboard"
            >
              Back to dashboard
            </Link>
          </div>
        </section>

        <AdminDonorRequestsTable requests={requests} />
      </div>
    </main>
  );
}
