import Link from "next/link";

import { BriefEditor } from "@/components/brief/brief-editor";
import { getBriefEditorData } from "@/lib/brief";
import { toBriefFormData } from "@/lib/brief-shared";

type BriefEditorPageProps = {
  params: {
    id: string;
  };
};

export default async function ApplicationBriefEditorPage({
  params,
}: BriefEditorPageProps) {
  const data = await getBriefEditorData(params.id);

  return (
    <main className="min-h-screen bg-[#0B1622] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <Link
            className="text-sm text-[#C09A45] hover:text-[#F4E3B2]"
            href={`/applications/${params.id}?tab=brief`}
          >
            Back to application
          </Link>
          <h1 className="mt-3 text-3xl font-semibold">{data.org.legal_name}</h1>
          <p className="mt-2 text-sm text-slate-300">
            Create and publish a donor-facing brief for this application.
          </p>
        </div>

        <BriefEditor
          applicationId={params.id}
          initialData={toBriefFormData(data.brief)}
          initialGeneratedAt={data.brief?.generated_at ?? null}
          initialIsStale={data.isStale}
          initialPublicUrl={data.publicUrl}
          org={data.org}
        />
      </div>
    </main>
  );
}
