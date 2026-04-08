import "server-only";

import Anthropic from "@anthropic-ai/sdk";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Database, Document } from "@/lib/supabase/types";

const DEFAULT_MODEL = "claude-sonnet-4-6";

type AnalysisSource = "990_analysis" | "bylaws_analysis" | "doctrinal_analysis";

type AnalysisConfig = {
  prompt: string;
  source: AnalysisSource;
};

function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to your environment before running document analysis.",
    );
  }

  return new Anthropic({ apiKey });
}

function getDocumentConfig(documentType: string): AnalysisConfig | null {
  const normalized = documentType.toLowerCase();

  if (normalized === "990" || normalized.includes("form_990")) {
    return {
      prompt: `Analyze this IRS Form 990. Extract and return ONLY a JSON object:
{
  "total_revenue": number,
  "total_expenses": number,
  "program_expenses": number,
  "management_expenses": number,
  "fundraising_expenses": number,
  "program_ratio": number,
  "executive_compensation": number,
  "year": number,
  "concerns": ["list any red flags like unusually high exec pay, large related-party transactions, etc"],
  "summary": "2-3 sentence plain English summary of financial health"
}`,
      source: "990_analysis",
    };
  }

  if (normalized.includes("doctrinal")) {
    return {
      prompt:
        'Analyze this doctrinal statement. Return JSON: { "gospel_clear": boolean, "scripture_position": string, "concerns": [], "summary": string }',
      source: "doctrinal_analysis",
    };
  }

  if (normalized.includes("bylaws")) {
    return {
      prompt:
        'Analyze these bylaws. Return JSON: { "board_independence_clear": boolean, "conflict_of_interest_mentioned": boolean, "removal_process_defined": boolean, "concerns": [], "summary": string }',
      source: "bylaws_analysis",
    };
  }

  return null;
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
    throw new Error("Claude response did not contain valid JSON.");
  }

  return raw.slice(start, end + 1);
}

function getStatusFromAnalysis(result: unknown) {
  const concerns =
    result &&
    typeof result === "object" &&
    !Array.isArray(result) &&
    Array.isArray((result as Record<string, unknown>).concerns)
      ? ((result as Record<string, unknown>).concerns as unknown[]).filter(
          (item) => typeof item === "string" && item.trim().length > 0,
        )
      : [];

  return {
    concerns,
    status: concerns.length > 0 ? "flag" : "pass",
    summary:
      result &&
      typeof result === "object" &&
      !Array.isArray(result) &&
      typeof (result as Record<string, unknown>).summary === "string"
        ? ((result as Record<string, unknown>).summary as string)
        : "Document analysis completed.",
  };
}

async function analyzeSingleDocument(
  client: Anthropic,
  document: Document,
  applicationId: string,
) {
  const config = getDocumentConfig(document.document_type);

  if (!config) {
    return null;
  }

  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from("ministry-documents")
    .download(document.storage_path);

  if (error || !data) {
    throw new Error(
      error?.message ?? `Unable to download ${document.file_name}.`,
    );
  }

  const arrayBuffer = await data.arrayBuffer();
  const base64data = Buffer.from(arrayBuffer).toString("base64");

  const response = await client.messages.create({
    max_tokens: 1500,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: base64data,
            },
          },
          {
            type: "text",
            text: config.prompt,
          },
        ],
      },
    ],
    model: DEFAULT_MODEL,
  });

  const parsed = JSON.parse(
    extractJsonObject(extractTextContent(response.content)),
  ) as Record<string, unknown>;
  const { status, summary } = getStatusFromAnalysis(parsed);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;
  await db
    .from("external_checks")
    .delete()
    .eq("application_id", applicationId)
    .eq("source", config.source)
    .filter("raw_result->>document_id", "eq", document.id);

  await db.from("external_checks").insert({
    application_id: applicationId,
    raw_result: {
      ...parsed,
      document_id: document.id,
      document_name: document.file_name,
      model: DEFAULT_MODEL,
    },
    score_impact: null,
    source: config.source,
    status,
    summary,
  } satisfies Database["public"]["Tables"]["external_checks"]["Insert"]);

  return {
    documentId: document.id,
    source: config.source,
    status,
    summary,
  };
}

export async function analyzeDocuments(applicationId: string) {
  const admin = createAdminClient();
  const client = getAnthropicClient();
  const { data: documents, error } = await admin
    .from("documents")
    .select("*")
    .eq("application_id", applicationId)
    .order("uploaded_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const relevantDocuments = ((documents ?? []) as Document[]).filter(
    (document) => Boolean(getDocumentConfig(document.document_type)),
  );

  const results = [];

  for (const document of relevantDocuments) {
    const result = await analyzeSingleDocument(client, document, applicationId);

    if (result) {
      results.push(result);
    }
  }

  return results;
}
