import { ViewModeSwitcher } from "@/components/app/view-mode-switcher";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { StaffShell } from "@/components/dashboard/staff-shell";
import { VoiceAlignmentManager } from "@/components/dashboard/voice-alignment-manager";
import { Badge, Monogram, PageTitle } from "@/components/save/primitives";
import { TopBar } from "@/components/save/shell";
import { getApplicationDetail } from "@/lib/review";
import { getRequestBaseUrl } from "@/lib/voice-alignment";
import { getViewerContext } from "@/lib/view-mode";

/**
 * Voice alignment for one application, on the approved design.
 *
 * Access is gated by getApplicationDetail (admin/reviewer only). Reference
 * feedback is confidential to the SAVE team and is never attributed back to
 * the person who gave it.
 */
export default async function VoiceAlignmentPage({
  params,
}: {
  params: { id: string };
}) {
  const [data, viewer] = await Promise.all([
    getApplicationDetail(params.id),
    getViewerContext(),
  ]);

  return (
    <StaffShell
      active="queue"
      topBar={
        <TopBar
          actions={
            <>
              <ViewModeSwitcher
                canPreview={viewer.canPreview}
                currentViewMode={viewer.currentViewMode}
              />
              <SignOutButton className="save-focus-ring rounded-md border border-hairline px-3 py-1.5 text-caption font-semibold text-ink-500 transition hover:bg-paper-200 hover:text-ink-800" />
            </>
          }
          breadcrumb={[
            { href: "/dashboard", label: "Queue" },
            {
              href: `/applications/${params.id}`,
              label: data.organization.legal_name,
            },
            { label: "Voice alignment" },
          ]}
          status={<Badge tone="neutral">{data.voiceAlignment.status}</Badge>}
        />
      }
    >
      <div className="flex flex-wrap items-start gap-5">
        <Monogram name={data.organization.legal_name} size="lg" />
        <div className="min-w-0 flex-1">
          <PageTitle
            description="What the people around this ministry say, gathered independently from staff and from outside references."
            eyebrow={`Application ${data.application.id.slice(0, 8)}`}
          >
            Voice alignment
          </PageTitle>
        </div>
      </div>

      <div className="mt-7">
        <VoiceAlignmentManager
          applicationId={params.id}
          baseUrl={getRequestBaseUrl()}
          organizationName={data.organization.legal_name}
          summary={data.voiceAlignment}
        />
      </div>
    </StaffShell>
  );
}
