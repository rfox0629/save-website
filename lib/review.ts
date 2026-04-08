import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type {
  Applications,
  Database,
  Document,
  DonorBrief,
  ExternalCheck,
  Organizations,
  Profile,
  ReviewerNote,
  RiskFlag,
  Score,
  ScoreComponent,
} from "@/lib/supabase/types";

type ApplicationStatus = Applications["status"];
type FlagSeverity = RiskFlag["severity"];

export type ReviewerOption = {
  email: string;
  id: string;
  role: Profile["role"];
};

export type DashboardFilters = {
  flagSeverity?: string;
  scoreRange?: string;
  status?: string;
};

export type DashboardApplicationRow = {
  application: Applications;
  assignedReviewer: string | null;
  flagCount: number;
  highestSeverity: FlagSeverity | null;
  latestScore: Score | null;
  organization: Organizations;
};

export type DashboardData = {
  filters: DashboardFilters;
  rows: DashboardApplicationRow[];
  summary: {
    approved: number;
    pendingInquiry: number;
    total: number;
    underReview: number;
  };
};

export type ApplicationDetailData = {
  application: Applications;
  assignedReviewer: string | null;
  brief: DonorBrief | null;
  documents: Array<
    Document & {
      signedUrl: string | null;
      uploadedByEmail: string | null;
    }
  >;
  externalChecks: ExternalCheck[];
  flags: RiskFlag[];
  latestScore: Score | null;
  organization: Organizations;
  reviewerOptions: ReviewerOption[];
  scoreComponents: ScoreComponent[];
  scoreRecommendation: string;
  scoreSegments: {
    color: string;
    max: number;
    score: number;
  }[];
  scoreSummary: {
    doctrine: number;
    external: number;
    financial: number;
    fruit: number;
    governance: number;
    leadership: number;
    max: number;
    total: number;
  };
  notes: Array<
    ReviewerNote & {
      reviewerEmail: string | null;
    }
  >;
};

const SCORE_SEGMENT_COLORS = [
  "#C09A45",
  "#4C7D9B",
  "#6B8A5C",
  "#B76E4B",
  "#8F6BB3",
  "#3E9C8F",
] as const;

const EXTERNAL_CHECK_SOURCES = [
  "irs_teos",
  "form_990",
  "charity_navigator",
  "candid",
  "website",
  "news_search",
  "ecfa_search",
  "references",
] as const;

export function getExternalCheckSources() {
  return [...EXTERNAL_CHECK_SOURCES];
}

export function getExternalCheckLabel(source: string) {
  if (source.startsWith("form_990_")) {
    return `Form 990 ${source.replace("form_990_", "")}`;
  }

  const labels: Record<string, string> = {
    "990_analysis": "990 Analysis",
    bylaws_analysis: "Bylaws Analysis",
    candid: "Candid",
    charity_navigator: "Charity Navigator",
    doctrinal_analysis: "Doctrinal Analysis",
    ecfa_search: "ECFA",
    form_990: "Form 990",
    irs_teos: "IRS TEOS",
    news_search: "News Search",
    references: "References",
    website: "Website",
  };

  return (
    labels[source] ??
    source
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

function severityRank(severity: FlagSeverity) {
  switch (severity) {
    case "hard_stop":
      return 4;
    case "high":
      return 3;
    case "medium":
      return 2;
    case "low":
      return 1;
    default:
      return 0;
  }
}

function getHighestSeverity(flags: RiskFlag[]) {
  if (flags.length === 0) {
    return null;
  }

  return (
    [...flags].sort(
      (left, right) =>
        severityRank(right.severity) - severityRank(left.severity),
    )[0]?.severity ?? null
  );
}

function matchesScoreRange(score: number | null, range?: string) {
  if (!range || range === "all") {
    return true;
  }

  if (range === "unscored") {
    return score === null;
  }

  if (score === null) {
    return false;
  }

  if (range === "80_plus") {
    return score >= 80;
  }

  if (range === "60_79") {
    return score >= 60 && score < 80;
  }

  if (range === "below_60") {
    return score < 60;
  }

  return true;
}

function matchesFlagSeverity(severity: FlagSeverity | null, filter?: string) {
  if (!filter || filter === "all") {
    return true;
  }

  if (filter === "any") {
    return severity !== null;
  }

  return severity === filter;
}

export function getStatusLabel(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getStatusPillClass(status: string) {
  if (status === "approved") {
    return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
  }

  if (status === "under_review" || status === "inquiry_approved") {
    return "border-sky-400/20 bg-sky-400/10 text-sky-200";
  }

  if (status === "declined" || status === "hard_stop") {
    return "border-rose-400/20 bg-rose-400/10 text-rose-200";
  }

  if (status === "more_info_requested") {
    return "border-amber-400/20 bg-amber-400/10 text-amber-200";
  }

  return "border-white/10 bg-white/5 text-slate-200";
}

export function getScoreTone(score: number | null) {
  if (score === null) {
    return "text-slate-300";
  }

  if (score >= 80) {
    return "text-emerald-300";
  }

  if (score >= 60) {
    return "text-amber-300";
  }

  return "text-rose-300";
}

export function getSeverityClass(severity: FlagSeverity) {
  if (severity === "hard_stop") {
    return "border-rose-500/30 bg-rose-500/15 text-rose-200";
  }

  if (severity === "high") {
    return "border-orange-400/30 bg-orange-400/15 text-orange-200";
  }

  if (severity === "medium") {
    return "border-amber-400/30 bg-amber-400/15 text-amber-200";
  }

  return "border-slate-300/20 bg-slate-300/10 text-slate-200";
}

export function getRecommendationLevel(score: Score | null) {
  if (!score) {
    return "Not scored";
  }

  if (score.is_hard_stop) {
    return "Hard stop";
  }

  if ((score.total_score ?? 0) >= 80) {
    return "Recommend";
  }

  if ((score.total_score ?? 0) >= 65) {
    return "Proceed with caution";
  }

  return "Decline";
}

async function getCurrentProfile() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, organization_id")
    .eq("id", user.id)
    .maybeSingle();

  return {
    profile: (profile as Profile | null) ?? null,
    user,
  };
}

export async function requireReviewerPageAccess() {
  const context = await getCurrentProfile();

  if (!context?.user) {
    redirect("/login");
  }

  if (context.profile?.role === "ministry") {
    redirect("/portal");
  }

  if (
    context.profile?.role !== "admin" &&
    context.profile?.role !== "reviewer"
  ) {
    redirect("/login");
  }

  return context;
}

export async function requireAdminPageAccess() {
  const context = await getCurrentProfile();

  if (!context?.user) {
    redirect("/login");
  }

  if (context.profile?.role === "ministry") {
    redirect("/portal");
  }

  if (context.profile?.role === "donor") {
    redirect("/donors");
  }

  if (context.profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return context;
}

export async function requireReviewerMutationAccess() {
  const context = await getCurrentProfile();

  if (!context?.user) {
    throw new Error("Unauthorized");
  }

  if (
    context.profile?.role !== "admin" &&
    context.profile?.role !== "reviewer"
  ) {
    throw new Error("Forbidden");
  }

  return context;
}

async function getUserEmailMap(userIds: string[]) {
  const admin = createAdminClient();
  const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
  const entries = await Promise.all(
    uniqueIds.map(async (id) => {
      const { data } = await admin.auth.admin.getUserById(id);
      return [id, data.user?.email ?? null] as const;
    }),
  );

  return new Map(entries);
}

export async function getReviewerOptions() {
  const admin = createAdminClient();
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, role")
    .in("role", ["admin", "reviewer"])
    .order("role", { ascending: true });
  const reviewerProfiles = (profiles ?? []) as Pick<Profile, "id" | "role">[];
  const emailMap = await getUserEmailMap(
    reviewerProfiles.map((item) => item.id),
  );

  return reviewerProfiles
    .map((profile) => ({
      email: emailMap.get(profile.id) ?? "Unknown reviewer",
      id: profile.id,
      role: profile.role,
    }))
    .sort((left, right) => left.email.localeCompare(right.email));
}

export async function getDashboardData(
  filters: DashboardFilters,
): Promise<DashboardData> {
  await requireReviewerPageAccess();

  const admin = createAdminClient();
  const [
    { data: applications },
    { data: organizations },
    { data: scores },
    { data: flags },
  ] = await Promise.all([
    admin
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false }),
    admin.from("organizations").select("*"),
    admin
      .from("scores")
      .select("*")
      .order("calculated_at", { ascending: false }),
    admin.from("risk_flags").select("*"),
  ]);

  const applicationRows = (applications ?? []) as Applications[];
  const organizationRows = (organizations ?? []) as Organizations[];
  const scoreRows = (scores ?? []) as Score[];
  const flagRows = (flags ?? []) as RiskFlag[];

  const organizationMap = new Map(
    organizationRows.map((organization) => [organization.id, organization]),
  );

  const latestScoreMap = new Map<string, Score>();
  for (const score of scoreRows) {
    if (!latestScoreMap.has(score.application_id)) {
      latestScoreMap.set(score.application_id, score);
    }
  }

  const flagsByApplication = flagRows.reduce<Map<string, RiskFlag[]>>(
    (map, flag) => {
      const current = map.get(flag.application_id) ?? [];
      current.push(flag);
      map.set(flag.application_id, current);
      return map;
    },
    new Map(),
  );

  const assignedReviewerIds = organizationRows
    .map((organization) => organization.assigned_reviewer_id)
    .filter((value): value is string => Boolean(value));
  const reviewerEmailMap = await getUserEmailMap(assignedReviewerIds);

  const rows = applicationRows
    .map<DashboardApplicationRow | null>((application) => {
      const organization = organizationMap.get(application.organization_id);

      if (!organization) {
        return null;
      }

      const appFlags = flagsByApplication.get(application.id) ?? [];
      const latestScore = latestScoreMap.get(application.id) ?? null;
      const highestSeverity = getHighestSeverity(appFlags);

      return {
        application,
        assignedReviewer: organization.assigned_reviewer_id
          ? (reviewerEmailMap.get(organization.assigned_reviewer_id) ?? null)
          : null,
        flagCount: appFlags.length,
        highestSeverity,
        latestScore,
        organization,
      };
    })
    .filter((row): row is DashboardApplicationRow => row !== null)
    .filter((row) =>
      filters.status && filters.status !== "all"
        ? row.application.status === filters.status
        : true,
    )
    .filter((row) =>
      matchesScoreRange(
        row.latestScore?.total_score ?? null,
        filters.scoreRange,
      ),
    )
    .filter((row) =>
      matchesFlagSeverity(row.highestSeverity, filters.flagSeverity),
    );

  const summary = {
    approved: applicationRows.filter((item) => item.status === "approved")
      .length,
    pendingInquiry: applicationRows.filter(
      (item) => item.status === "inquiry_submitted",
    ).length,
    total: applicationRows.length,
    underReview: applicationRows.filter(
      (item) => item.status === "under_review",
    ).length,
  };

  return {
    filters,
    rows,
    summary,
  };
}

export async function getApplicationDetail(
  applicationId: string,
): Promise<ApplicationDetailData> {
  await requireReviewerPageAccess();

  const admin = createAdminClient();
  const { data: application } = await admin
    .from("applications")
    .select("*")
    .eq("id", applicationId)
    .maybeSingle();
  const resolvedApplication = application as Applications | null;

  if (!resolvedApplication) {
    redirect("/dashboard");
  }

  const [
    { data: organization },
    { data: scores },
    { data: flags },
    { data: documents },
    { data: externalChecks },
    { data: notes },
    { data: brief },
  ] = await Promise.all([
    admin
      .from("organizations")
      .select("*")
      .eq("id", resolvedApplication.organization_id)
      .maybeSingle(),
    admin
      .from("scores")
      .select("*")
      .eq("application_id", applicationId)
      .order("calculated_at", { ascending: false }),
    admin.from("risk_flags").select("*").eq("application_id", applicationId),
    admin
      .from("documents")
      .select("*")
      .eq("application_id", applicationId)
      .order("uploaded_at", { ascending: false }),
    admin
      .from("external_checks")
      .select("*")
      .eq("application_id", applicationId)
      .order("checked_at", { ascending: false }),
    admin
      .from("reviewer_notes")
      .select("*")
      .eq("application_id", applicationId)
      .order("created_at", { ascending: false }),
    admin
      .from("donor_briefs")
      .select("*")
      .eq("application_id", applicationId)
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const resolvedOrganization = organization as Organizations | null;

  if (!resolvedOrganization) {
    redirect("/dashboard");
  }

  const latestScore = ((scores ?? []) as Score[])[0] ?? null;
  const scoreComponents = latestScore
    ? (((
        await admin
          .from("score_components")
          .select("*")
          .eq("score_id", latestScore.id)
          .order("category", { ascending: true })
      ).data ?? []) as ScoreComponent[])
    : [];

  const resolvedFlags = ((flags ?? []) as RiskFlag[]).sort(
    (left, right) => severityRank(right.severity) - severityRank(left.severity),
  );
  const resolvedDocuments = (documents ?? []) as Document[];
  const resolvedExternalChecks = (externalChecks ?? []) as ExternalCheck[];
  const resolvedNotes = (notes ?? []) as ReviewerNote[];
  const resolvedBrief = (brief as DonorBrief | null) ?? null;

  const reviewerOptions = await getReviewerOptions();
  const actorEmailMap = await getUserEmailMap([
    ...resolvedNotes.map((note) => note.reviewer_id),
    ...resolvedDocuments
      .map((document) => document.uploaded_by)
      .filter((value): value is string => Boolean(value)),
    ...(resolvedOrganization.assigned_reviewer_id
      ? [resolvedOrganization.assigned_reviewer_id]
      : []),
  ]);

  const signedDocuments = await Promise.all(
    resolvedDocuments.map(async (document) => {
      const { data } = await admin.storage
        .from("ministry-documents")
        .createSignedUrl(document.storage_path, 60 * 30);

      return {
        ...document,
        signedUrl: data?.signedUrl ?? null,
        uploadedByEmail: document.uploaded_by
          ? (actorEmailMap.get(document.uploaded_by) ?? null)
          : null,
      };
    }),
  );

  const scoreSummary = {
    doctrine: latestScore?.doctrine_score ?? 0,
    external: latestScore?.external_trust_score ?? 0,
    financial: latestScore?.financial_score ?? 0,
    fruit: latestScore?.fruit_score ?? 0,
    governance: latestScore?.governance_score ?? 0,
    leadership: latestScore?.leadership_score ?? 0,
    max: 100,
    total: latestScore?.total_score ?? 0,
  };

  return {
    application: resolvedApplication,
    assignedReviewer: resolvedOrganization.assigned_reviewer_id
      ? (actorEmailMap.get(resolvedOrganization.assigned_reviewer_id) ?? null)
      : null,
    brief: resolvedBrief,
    documents: signedDocuments,
    externalChecks: [
      ...resolvedExternalChecks,
      ...EXTERNAL_CHECK_SOURCES.filter(
        (source) =>
          !resolvedExternalChecks.some((check) => check.source === source),
      ).map((source) => ({
        application_id: applicationId,
        checked_at: "",
        checked_by: null,
        id: "",
        raw_result: {},
        score_impact: null,
        source,
        status: "pending",
        summary: null,
      })),
    ],
    flags: resolvedFlags,
    latestScore,
    notes: resolvedNotes.map((note) => ({
      ...note,
      reviewerEmail: actorEmailMap.get(note.reviewer_id) ?? null,
    })),
    organization: resolvedOrganization,
    reviewerOptions,
    scoreComponents,
    scoreRecommendation: getRecommendationLevel(latestScore),
    scoreSegments: [
      {
        color: SCORE_SEGMENT_COLORS[0],
        max: 20,
        score: scoreSummary.leadership,
      },
      { color: SCORE_SEGMENT_COLORS[1], max: 15, score: scoreSummary.doctrine },
      {
        color: SCORE_SEGMENT_COLORS[2],
        max: 15,
        score: scoreSummary.governance,
      },
      {
        color: SCORE_SEGMENT_COLORS[3],
        max: 20,
        score: scoreSummary.financial,
      },
      { color: SCORE_SEGMENT_COLORS[4], max: 20, score: scoreSummary.fruit },
      { color: SCORE_SEGMENT_COLORS[5], max: 10, score: scoreSummary.external },
    ],
    scoreSummary,
  };
}

async function getLatestScoreOrThrow(applicationId: string) {
  const admin = createAdminClient();
  const { data: scores } = await admin
    .from("scores")
    .select("*")
    .eq("application_id", applicationId)
    .order("calculated_at", { ascending: false })
    .limit(1);
  const score = ((scores ?? []) as Score[])[0];

  if (!score) {
    throw new Error("No score found for this application.");
  }

  return score;
}

function revalidateReviewPaths(applicationId: string) {
  revalidatePath("/dashboard");
  revalidatePath(`/applications/${applicationId}`);
}

export async function updateApplicationStatus(params: {
  applicationId: string;
  status: ApplicationStatus;
}) {
  await requireReviewerMutationAccess();
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;

  const { error } = await db
    .from("applications")
    .update({ status: params.status })
    .eq("id", params.applicationId);

  if (error) {
    throw new Error(error.message);
  }

  revalidateReviewPaths(params.applicationId);
}

export async function assignReviewer(params: {
  applicationId: string;
  reviewerId: string;
}) {
  await requireReviewerMutationAccess();
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;
  const { data: application } = await admin
    .from("applications")
    .select("organization_id")
    .eq("id", params.applicationId)
    .maybeSingle();

  const organizationId = (
    application as Pick<Applications, "organization_id"> | null
  )?.organization_id;

  if (!organizationId) {
    throw new Error("Application organization could not be found.");
  }

  const { error } = await db
    .from("organizations")
    .update({ assigned_reviewer_id: params.reviewerId })
    .eq("id", organizationId);

  if (error) {
    throw new Error(error.message);
  }

  revalidateReviewPaths(params.applicationId);
}

export async function overrideCategoryScore(params: {
  applicationId: string;
  category:
    | "leadership"
    | "doctrine"
    | "governance"
    | "financial"
    | "fruit"
    | "external";
  note: string;
  score: number;
}) {
  const { user } = await requireReviewerMutationAccess();
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;
  const latestScore = await getLatestScoreOrThrow(params.applicationId);

  const fieldMap = {
    doctrine: "doctrine_score",
    external: "external_trust_score",
    financial: "financial_score",
    fruit: "fruit_score",
    governance: "governance_score",
    leadership: "leadership_score",
  } as const;
  const scoreField = fieldMap[params.category];
  const currentTotals = {
    doctrine: latestScore.doctrine_score ?? 0,
    external: latestScore.external_trust_score ?? 0,
    financial: latestScore.financial_score ?? 0,
    fruit: latestScore.fruit_score ?? 0,
    governance: latestScore.governance_score ?? 0,
    leadership: latestScore.leadership_score ?? 0,
  };
  currentTotals[params.category] = params.score;

  const { error } = await db
    .from("scores")
    .update({
      [scoreField]: params.score,
      override_by: user.id,
      override_notes: `[${params.category}] ${params.note}`,
      total_score:
        currentTotals.leadership +
        currentTotals.doctrine +
        currentTotals.governance +
        currentTotals.financial +
        currentTotals.fruit +
        currentTotals.external,
    })
    .eq("id", latestScore.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidateReviewPaths(params.applicationId);
}

export async function resolveRiskFlag(params: {
  applicationId: string;
  flagId: string;
  resolutionNotes: string;
}) {
  const { user } = await requireReviewerMutationAccess();
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;

  const { error } = await db
    .from("risk_flags")
    .update({
      resolution_notes: params.resolutionNotes,
      resolved: true,
      resolved_at: new Date().toISOString(),
      resolved_by: user.id,
    })
    .eq("id", params.flagId)
    .eq("application_id", params.applicationId);

  if (error) {
    throw new Error(error.message);
  }

  revalidateReviewPaths(params.applicationId);
}

export async function markDocumentReviewed(params: {
  applicationId: string;
  documentId: string;
  reviewed: boolean;
}) {
  const { user } = await requireReviewerMutationAccess();
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;

  const { error } = await db
    .from("documents")
    .update({
      reviewed: params.reviewed,
      reviewer_id: params.reviewed ? user.id : null,
    })
    .eq("id", params.documentId)
    .eq("application_id", params.applicationId);

  if (error) {
    throw new Error(error.message);
  }

  revalidateReviewPaths(params.applicationId);
}

export async function saveExternalCheck(params: {
  applicationId: string;
  checkId?: string;
  note?: string;
  rawResult?: Database["public"]["Tables"]["external_checks"]["Row"]["raw_result"];
  scoreImpact?: number | null;
  source: string;
  status: string;
  summary: string;
}) {
  const { user } = await requireReviewerMutationAccess();
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;
  const { data: existing } = await admin
    .from("external_checks")
    .select("*")
    .eq("application_id", params.applicationId)
    .eq(params.checkId ? "id" : "source", params.checkId ?? params.source)
    .order("checked_at", { ascending: false })
    .limit(1);
  const existingRow = ((existing ?? []) as ExternalCheck[])[0] ?? null;
  const existingRawResult =
    existingRow?.raw_result &&
    typeof existingRow.raw_result === "object" &&
    !Array.isArray(existingRow.raw_result)
      ? (existingRow.raw_result as Record<string, unknown>)
      : {};

  const payload: Database["public"]["Tables"]["external_checks"]["Insert"] = {
    application_id: params.applicationId,
    checked_at: new Date().toISOString(),
    checked_by: user.id,
    raw_result: {
      ...existingRawResult,
      ...(params.rawResult &&
      typeof params.rawResult === "object" &&
      !Array.isArray(params.rawResult)
        ? params.rawResult
        : {}),
      ...(params.note?.trim()
        ? {
            reviewer_override: {
              note: params.note.trim(),
              overridden_at: new Date().toISOString(),
              overridden_by: user.id,
            },
          }
        : {}),
    },
    score_impact: params.scoreImpact ?? null,
    source: params.source,
    status: params.status,
    summary: params.summary,
  };

  const query = existingRow?.id
    ? db.from("external_checks").update(payload).eq("id", existingRow.id)
    : db.from("external_checks").insert(payload);

  const { error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  revalidateReviewPaths(params.applicationId);
}

export async function createReviewerNote(params: {
  applicationId: string;
  note: string;
  section: string;
}) {
  const { user } = await requireReviewerMutationAccess();
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;

  const { error } = await db.from("reviewer_notes").insert({
    application_id: params.applicationId,
    is_internal: true,
    note: params.note,
    reviewer_id: user.id,
    section: params.section,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidateReviewPaths(params.applicationId);
}
