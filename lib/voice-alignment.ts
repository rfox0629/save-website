import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

import { requireReviewerMutationAccess } from "@/lib/review";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  Applications,
  Database,
  Json,
  Organizations,
  VoiceAlignmentRequest,
  VoiceAlignmentResponse,
  VoiceAlignmentSummaryRecord,
} from "@/lib/supabase/types";

const DEFAULT_MODEL = "claude-sonnet-4-6";
const MIN_EXTERNAL_RESPONSES = 2;
const MIN_INTERNAL_RESPONSES = 3;

export const voiceAlignmentRequestTypeSchema = z.enum(["internal", "external"]);

const createRequestSchema = z.object({
  relationship: z.string().max(120).optional(),
  requestType: voiceAlignmentRequestTypeSchema,
  respondentEmail: z.string().email("Enter a valid email address."),
  respondentName: z.string().min(2, "Respondent name is required."),
});

const sharedResponseFields = {
  relationship: z.string().min(2, "Relationship is required."),
  respondentEmail: z.string().email("Enter a valid email address."),
  respondentName: z.string().min(2, "Name is required."),
  yearsContextKnown: z
    .string()
    .min(1, "Years/context known is required.")
    .max(120, "Keep this under 120 characters."),
};

const internalResponseSchema = z.object({
  ...sharedResponseFields,
  concerns: z.string().max(1200).optional(),
  growthAreas: z.string().min(10, "Growth areas are required."),
  internalCulture: z.string().min(10, "Internal culture feedback is required."),
  leaderCharacter: z.string().min(10, "Leader character feedback is required."),
  orgStrengths: z.string().min(10, "Organization strengths are required."),
  trustRecommendation: z.string().min(2, "Trust recommendation is required."),
});

const externalResponseSchema = z.object({
  ...sharedResponseFields,
  additionalComments: z.string().max(1200).optional(),
  concernsInconsistencies: z
    .string()
    .min(10, "Concerns or inconsistencies are required."),
  orgLeaderDescription: z
    .string()
    .min(10, "Organization/leader description is required."),
  positiveObservations: z
    .string()
    .min(10, "Positive observations are required."),
  supportRecommendation: z
    .string()
    .min(2, "Support recommendation is required."),
});

const voiceAlignmentInsightSchema = z.object({
  alignment_insight: z.string(),
  alignment_status: z.enum([
    "aligned",
    "partially_aligned",
    "misaligned",
    "insufficient_data",
  ]),
  external_summary: z.object({
    concerns: z.array(z.string()),
    strengths: z.array(z.string()),
    themes: z.array(z.string()),
  }),
  follow_up_questions: z.array(z.string()),
  internal_summary: z.object({
    concerns: z.array(z.string()),
    strengths: z.array(z.string()),
    themes: z.array(z.string()),
  }),
});

type LoadedApplication = Pick<Applications, "id" | "organization_id"> & {
  organizations: Organizations | null;
};

export type VoiceAlignmentRequestType = z.infer<
  typeof voiceAlignmentRequestTypeSchema
>;
export type CreateVoiceAlignmentRequestInput = z.infer<
  typeof createRequestSchema
>;
export type InternalVoiceAlignmentResponseInput = z.infer<
  typeof internalResponseSchema
>;
export type ExternalVoiceAlignmentResponseInput = z.infer<
  typeof externalResponseSchema
>;
export type VoiceAlignmentInsight = z.infer<
  typeof voiceAlignmentInsightSchema
>;

export type VoiceAlignmentCollectionStatus =
  | "Collecting Responses"
  | "Not Started"
  | "Ready for Summary";

export type VoiceAlignmentInvite = VoiceAlignmentRequest & {
  response: VoiceAlignmentResponse | null;
};

export type StoredVoiceAlignmentInsight = {
  generatedAt: string;
  id: string;
  status: VoiceAlignmentInsight["alignment_status"];
  summary: VoiceAlignmentInsight;
};

export type VoiceAlignmentSummary = {
  alignmentSummary: StoredVoiceAlignmentInsight | null;
  externalCount: number;
  internalCount: number;
  invites: VoiceAlignmentInvite[];
  status: VoiceAlignmentCollectionStatus;
};

export type GenerateVoiceAlignmentResult =
  | {
      externalCount: number;
      internalCount: number;
      state: "generated";
      summary: VoiceAlignmentInsight;
    }
  | {
      externalCount: number;
      internalCount: number;
      minimumExternal: number;
      minimumInternal: number;
      state: "insufficient_data";
      summary: null;
    };

export function getVoiceAlignmentStatus(
  internalCount: number,
  externalCount: number,
  requestCount = 0,
): VoiceAlignmentCollectionStatus {
  if (requestCount === 0 && internalCount === 0 && externalCount === 0) {
    return "Not Started";
  }

  if (
    internalCount >= MIN_INTERNAL_RESPONSES &&
    externalCount >= MIN_EXTERNAL_RESPONSES
  ) {
    return "Ready for Summary";
  }

  return "Collecting Responses";
}

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to your environment before generating alignment summaries.",
    );
  }

  return new Anthropic({ apiKey });
}

function compactValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  if (Array.isArray(value)) {
    const compacted = value
      .map((item) => compactValue(item))
      .filter((item): item is NonNullable<typeof item> => item !== undefined);

    return compacted.length > 0 ? compacted : undefined;
  }

  return value;
}

function compactRecord(record: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(record).flatMap(([key, value]) => {
      const compacted = compactValue(value);
      return compacted === undefined ? [] : [[key, compacted]];
    }),
  );
}

function extractTextContent(content: Anthropic.Messages.ContentBlock[]) {
  return content
    .filter(
      (block): block is Anthropic.Messages.TextBlock => block.type === "text",
    )
    .map((block) => block.text)
    .join("\n")
    .trim();
}

function extractJsonObject(text: string) {
  const fencedMatch = text.match(/```json\s*([\s\S]*?)```/i);
  const raw = fencedMatch?.[1] ?? text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error(
      "Claude response did not contain valid voice alignment summary JSON.",
    );
  }

  return raw.slice(start, end + 1);
}

function buildOrganizationPayload(organization: Organizations) {
  return compactRecord({
    dba_name: organization.dba_name,
    geographic_scope: organization.geographic_scope,
    legal_name: organization.legal_name,
    primary_focus: organization.primary_focus,
    website_url: organization.website_url,
    year_founded: organization.year_founded,
  });
}

function buildInternalResponsesPayload(responses: VoiceAlignmentResponse[]) {
  return responses.map((response) =>
    compactRecord({
      concerns: response.concerns,
      growth_areas: response.growth_areas,
      internal_culture: response.internal_culture,
      leader_character: response.leader_character,
      org_strengths: response.org_strengths,
      relationship: response.role_relationship,
      trust_recommendation: response.trust_recommendation,
      years_context_known: response.years_context_known,
    }),
  );
}

function buildExternalResponsesPayload(responses: VoiceAlignmentResponse[]) {
  return responses.map((response) =>
    compactRecord({
      additional_comments: response.additional_comments,
      concerns_inconsistencies: response.concerns_inconsistencies,
      org_leader_description: response.org_leader_description,
      positive_observations: response.positive_observations,
      relationship: response.role_relationship,
      support_recommendation: response.support_recommendation,
      years_context_known: response.years_context_known,
    }),
  );
}

function buildAlignmentPrompt(payload: Record<string, unknown>) {
  return `You are preparing a Voice Alignment summary for SAVE reviewers.

Analyze only the feedback provided below.
Do not make up facts.
Identify recurring themes that appear across responses, but be careful not to overstate weak evidence.
Distinguish internal perspectives from external perspectives.
Assess whether the two sets of perspectives appear aligned, partially aligned, or misaligned.
If evidence is limited or mixed, say so plainly.
Keep the output concise and reviewer-useful.

Return ONLY a valid JSON object with this exact structure:
{
  "internal_summary": {
    "themes": [],
    "strengths": [],
    "concerns": []
  },
  "external_summary": {
    "themes": [],
    "strengths": [],
    "concerns": []
  },
  "alignment_insight": "",
  "alignment_status": "aligned|partially_aligned|misaligned|insufficient_data",
  "follow_up_questions": []
}

Voice Alignment packet:
${JSON.stringify(payload, null, 2)}`;
}

function parseStoredAlignmentSummary(
  record: VoiceAlignmentSummaryRecord | null,
): StoredVoiceAlignmentInsight | null {
  if (!record) {
    return null;
  }

  try {
    return {
      generatedAt: record.generated_at,
      id: record.id,
      status: record.status,
      summary: voiceAlignmentInsightSchema.parse(record.summary),
    };
  } catch {
    return null;
  }
}

export function parseVoiceAlignmentInsight(
  value: Json | null | undefined,
): VoiceAlignmentInsight | null {
  if (!value) {
    return null;
  }

  try {
    return voiceAlignmentInsightSchema.parse(value);
  } catch {
    return null;
  }
}

async function loadVoiceAlignmentGenerationData(applicationId: string) {
  const admin = createAdminClient();
  const { data: application } = await admin
    .from("applications")
    .select("id, organization_id, organizations(*)")
    .eq("id", applicationId)
    .maybeSingle();
  const resolvedApplication = application as LoadedApplication | null;

  if (!resolvedApplication?.organizations) {
    throw new Error("Application organization could not be loaded.");
  }

  const { data: responses } = await admin
    .from("voice_alignment_responses")
    .select("*")
    .eq("application_id", applicationId)
    .order("submitted_at", { ascending: false });

  const responseRows = (responses ?? []) as VoiceAlignmentResponse[];
  const internalResponses = responseRows.filter(
    (response) => response.request_type === "internal",
  );
  const externalResponses = responseRows.filter(
    (response) => response.request_type === "external",
  );

  return {
    application: resolvedApplication,
    externalResponses,
    internalResponses,
  };
}

export async function getVoiceAlignmentSummary(
  applicationId: string,
): Promise<VoiceAlignmentSummary> {
  const admin = createAdminClient();
  const [{ data: requests }, { data: responses }, { data: summaryRecord }] =
    await Promise.all([
      admin
        .from("voice_alignment_requests")
        .select("*")
        .eq("application_id", applicationId)
        .order("created_at", { ascending: false }),
      admin
        .from("voice_alignment_responses")
        .select("*")
        .eq("application_id", applicationId)
        .order("submitted_at", { ascending: false }),
      admin
        .from("voice_alignment_summaries")
        .select("*")
        .eq("application_id", applicationId)
        .maybeSingle(),
    ]);

  const requestRows = (requests ?? []) as VoiceAlignmentRequest[];
  const responseRows = (responses ?? []) as VoiceAlignmentResponse[];
  const responseMap = new Map(
    responseRows.map((response) => [response.request_id, response]),
  );
  const internalCount = responseRows.filter(
    (response) => response.request_type === "internal",
  ).length;
  const externalCount = responseRows.filter(
    (response) => response.request_type === "external",
  ).length;

  return {
    alignmentSummary: parseStoredAlignmentSummary(
      (summaryRecord as VoiceAlignmentSummaryRecord | null) ?? null,
    ),
    externalCount,
    internalCount,
    invites: requestRows.map((request) => ({
      ...request,
      response: responseMap.get(request.id) ?? null,
    })),
    status: getVoiceAlignmentStatus(
      internalCount,
      externalCount,
      requestRows.length,
    ),
  };
}

export async function createVoiceAlignmentRequest(
  applicationId: string,
  input: CreateVoiceAlignmentRequestInput,
) {
  const parsed = createRequestSchema.parse(input);
  const { user } = await requireReviewerMutationAccess();
  const admin = createAdminClient();
  const { data: application } = await admin
    .from("applications")
    .select("id, organization_id")
    .eq("id", applicationId)
    .maybeSingle();
  const resolvedApplication = application as Pick<
    Applications,
    "id" | "organization_id"
  > | null;

  if (!resolvedApplication) {
    throw new Error("Application not found.");
  }

  const requestPayload: Database["public"]["Tables"]["voice_alignment_requests"]["Insert"] =
    {
      application_id: resolvedApplication.id,
      invited_by: user.id,
      organization_id: resolvedApplication.organization_id,
      relationship: parsed.relationship?.trim() || null,
      request_type: parsed.requestType,
      respondent_email: parsed.respondentEmail,
      respondent_name: parsed.respondentName,
    };

  const requestQuery = admin.from("voice_alignment_requests");
  const { error, data } = await requestQuery
    .insert(requestPayload)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to create feedback request.");
  }

  const request = data as VoiceAlignmentRequest;

  return {
    inviteUrl: `${getBaseUrl()}/voice-alignment/${request.invite_token}`,
    request,
  };
}

export async function getVoiceAlignmentInviteByToken(token: string) {
  const admin = createAdminClient();
  const { data: request } = await admin
    .from("voice_alignment_requests")
    .select("*")
    .eq("invite_token", token)
    .maybeSingle();
  const resolvedRequest = request as VoiceAlignmentRequest | null;

  if (!resolvedRequest) {
    return null;
  }

  const [{ data: application }, { data: organization }, { data: response }] =
    await Promise.all([
      admin
        .from("applications")
        .select("*")
        .eq("id", resolvedRequest.application_id)
        .maybeSingle(),
      admin
        .from("organizations")
        .select("*")
        .eq("id", resolvedRequest.organization_id)
        .maybeSingle(),
      admin
        .from("voice_alignment_responses")
        .select("*")
        .eq("request_id", resolvedRequest.id)
        .maybeSingle(),
    ]);

  return {
    application: application as Applications | null,
    organization: organization as Organizations | null,
    request: resolvedRequest,
    response: (response as VoiceAlignmentResponse | null) ?? null,
  };
}

export async function submitVoiceAlignmentResponse(
  token: string,
  input:
    | ExternalVoiceAlignmentResponseInput
    | InternalVoiceAlignmentResponseInput,
) {
  const invite = await getVoiceAlignmentInviteByToken(token);

  if (!invite?.request || !invite.organization || !invite.application) {
    throw new Error("Invite not found.");
  }

  if (invite.response || invite.request.status === "responded") {
    throw new Error("This feedback request has already been completed.");
  }

  const admin = createAdminClient();
  const isInternal = invite.request.request_type === "internal";
  const parsed = isInternal
    ? internalResponseSchema.parse(input)
    : externalResponseSchema.parse(input);

  const payload = {
    additional_comments:
      "additionalComments" in parsed
        ? (parsed.additionalComments?.trim() || null)
        : null,
    application_id: invite.application.id,
    concerns: "concerns" in parsed ? (parsed.concerns?.trim() || null) : null,
    concerns_inconsistencies:
      "concernsInconsistencies" in parsed
        ? parsed.concernsInconsistencies
        : null,
    growth_areas: "growthAreas" in parsed ? parsed.growthAreas : null,
    internal_culture: "internalCulture" in parsed ? parsed.internalCulture : null,
    leader_character:
      "leaderCharacter" in parsed ? parsed.leaderCharacter : null,
    org_leader_description:
      "orgLeaderDescription" in parsed ? parsed.orgLeaderDescription : null,
    org_strengths: "orgStrengths" in parsed ? parsed.orgStrengths : null,
    organization_id: invite.organization.id,
    positive_observations:
      "positiveObservations" in parsed ? parsed.positiveObservations : null,
    request_id: invite.request.id,
    request_type: invite.request.request_type,
    respondent_email: parsed.respondentEmail,
    respondent_name: parsed.respondentName,
    role_relationship: parsed.relationship,
    support_recommendation:
      "supportRecommendation" in parsed ? parsed.supportRecommendation : null,
    trust_recommendation:
      "trustRecommendation" in parsed ? parsed.trustRecommendation : null,
    years_context_known: parsed.yearsContextKnown,
  };

  const responseQuery = admin.from("voice_alignment_responses");
  // @ts-expect-error Supabase client inference for generated insert types is incorrect here.
  const { error } = await responseQuery.insert(payload);

  if (error) {
    throw new Error(error.message);
  }

  const { error: requestError } = await admin
    .from("voice_alignment_requests")
    .update({
      responded_at: new Date().toISOString(),
      status: "responded",
    })
    .eq("id", invite.request.id);

  if (requestError) {
    throw new Error(requestError.message);
  }

  return { success: true };
}

export async function generateVoiceAlignmentSummary(
  applicationId: string,
): Promise<GenerateVoiceAlignmentResult> {
  await requireReviewerMutationAccess();

  const anthropic = getAnthropicClient();
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;
  const { application, externalResponses, internalResponses } =
    await loadVoiceAlignmentGenerationData(applicationId);

  if (
    internalResponses.length < MIN_INTERNAL_RESPONSES ||
    externalResponses.length < MIN_EXTERNAL_RESPONSES
  ) {
    return {
      externalCount: externalResponses.length,
      internalCount: internalResponses.length,
      minimumExternal: MIN_EXTERNAL_RESPONSES,
      minimumInternal: MIN_INTERNAL_RESPONSES,
      state: "insufficient_data",
      summary: null,
    };
  }

  const payload = compactRecord({
    organization: buildOrganizationPayload(application.organizations),
    response_counts: {
      external: externalResponses.length,
      internal: internalResponses.length,
    },
    external_responses: buildExternalResponsesPayload(externalResponses),
    internal_responses: buildInternalResponsesPayload(internalResponses),
  });

  const response = await anthropic.messages.create({
    max_tokens: 1200,
    messages: [
      {
        content: buildAlignmentPrompt(payload),
        role: "user",
      },
    ],
    model: DEFAULT_MODEL,
  });

  const text = extractTextContent(response.content);

  if (!text) {
    throw new Error("Claude did not return a voice alignment summary.");
  }

  let summary: VoiceAlignmentInsight;

  try {
    summary = voiceAlignmentInsightSchema.parse(
      JSON.parse(extractJsonObject(text)),
    );
  } catch {
    throw new Error("Claude returned invalid voice alignment summary JSON.");
  }

  const { error } = await db
    .from("voice_alignment_summaries")
    .upsert(
      {
        application_id: application.id,
        generated_at: new Date().toISOString(),
        organization_id: application.organization_id,
        status: summary.alignment_status,
        summary: summary as Json,
      },
      { onConflict: "application_id" },
    );

  if (error) {
    throw new Error(error.message);
  }

  return {
    externalCount: externalResponses.length,
    internalCount: internalResponses.length,
    state: "generated",
    summary,
  };
}
