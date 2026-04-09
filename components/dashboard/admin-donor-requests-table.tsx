"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  approveDonorRequest,
  declineDonorRequest,
} from "@/app/actions/donor-requests";
import { Button } from "@/components/ui/button";
import type { DonorRequest } from "@/lib/supabase/types";

export function AdminDonorRequestsTable({
  requests,
}: {
  requests: DonorRequest[];
}) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function runAction(request: DonorRequest, action: "approve" | "decline") {
    setPendingId(request.id);
    setMessage(null);

    startTransition(async () => {
      const result =
        action === "approve"
          ? await approveDonorRequest(request.id)
          : await declineDonorRequest(request.id);

      if (result.error) {
        setMessage(result.error);
        toast.error(result.error);
      } else {
        const nextMessage =
          action === "approve"
            ? `Approved ${request.email} and sent invite.`
            : `Declined request for ${request.email}.`;
        setMessage(nextMessage);
        toast.success(nextMessage);
      }

      setPendingId(null);
    });
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
      {message ? (
        <div className="mb-5 rounded-2xl border border-[#C09A45]/20 bg-[#C09A45]/10 px-4 py-3 text-sm text-[#F4E3B2]">
          {message}
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10 text-left text-sm">
          <thead className="bg-white/[0.04] text-slate-300">
            <tr>
              <th className="px-5 py-4">Name</th>
              <th className="px-5 py-4">Email</th>
              <th className="px-5 py-4">Organization</th>
              <th className="px-5 py-4">Referral</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Date</th>
              <th className="px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {requests.map((request) => {
              const rowPending = isPending && pendingId === request.id;

              return (
                <tr className="bg-[#102133]/50" key={request.id}>
                  <td className="px-5 py-4 text-white">{request.full_name}</td>
                  <td className="px-5 py-4 text-slate-300">{request.email}</td>
                  <td className="px-5 py-4 text-slate-300">
                    {request.organization ?? "Not provided"}
                  </td>
                  <td className="px-5 py-4 text-slate-300">
                    {request.referral_source}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">
                      {request.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-300">
                    {new Date(request.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <Button
                        className="bg-[#C09A45] text-[#0B1622] hover:bg-[#d4ac57]"
                        disabled={rowPending || request.status === "approved"}
                        onClick={() => runAction(request, "approve")}
                        size="sm"
                        type="button"
                      >
                        Approve
                      </Button>
                      <Button
                        disabled={rowPending || request.status === "declined"}
                        onClick={() => runAction(request, "decline")}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        Decline
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {requests.length === 0 ? (
              <tr>
                <td
                  className="px-5 py-10 text-center text-slate-400"
                  colSpan={7}
                >
                  No donor access requests yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
