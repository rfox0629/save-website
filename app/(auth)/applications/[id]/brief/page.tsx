import { ViewModeSwitcher } from "@/components/app/view-mode-switcher";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { BriefEditor } from "@/components/brief/brief-editor";
import { StaffShell } from "@/components/dashboard/staff-shell";
import { Badge, Monogram, PageTitle } from "@/components/save/primitives";
import { TopBar } from "@/components/save/shell";
import { getBriefEditorData } from "@/lib/brief";
import { toBriefFormData } from "@/lib/brief-shared";
import { getViewerContext } from "@/lib/view-mode";

type BriefEditorPageProps = {
  params: {
    id: string;
  };
};

/**
 * The donor brief editor. What a donor reads first is written here by a
 * reviewer — never by the ministry — and it cannot reach donors until a second
 * reviewer has approved it.
 */
export default async function ApplicationBriefEditorPage({
  params,
}: BriefEditorPageProps) {
  const [data, viewer] = await Promise.all([
    getBriefEditorData(params.id),
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
              label: data.org.legal_name,
            },
            { label: "Donor brief" },
          ]}
          status={
            data.brief?.published ? (
              <Badge tone="sage">Published to donors</Badge>
            ) : (
              <Badge tone="neutral">Draft</Badge>
            )
          }
        />
      }
    >
      <div className="flex flex-wrap items-start gap-5">
        <Monogram name={data.org.legal_name} size="lg" />
        <div className="min-w-0 flex-1">
          <PageTitle
            description="What a donor reads first. Written by the reviewer, never by the ministry."
            eyebrow={`Application ${params.id.slice(0, 8)}`}
          >
            Donor brief
          </PageTitle>
        </div>
      </div>

      <div className="mt-7">
        <BriefEditor
          applicationId={params.id}
          approvedAt={data.approvedAt}
          approvedByEmail={data.approvedByEmail}
          initialData={toBriefFormData(data.brief)}
          initialGeneratedAt={data.brief?.generated_at ?? null}
          initialIsStale={data.isStale}
          initialPublicUrl={data.publicUrl}
          isAuthor={data.isAuthor}
          org={data.org}
        />
      </div>
    </StaffShell>
  );
}
