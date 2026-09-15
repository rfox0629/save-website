import "server-only";

import OpenAI from "openai";

/**
 * Shared OpenAI access for SAVE's AI features (reviewer summaries, voice
 * alignment synthesis, reputation checks, and document analysis).
 *
 * SAVE uses OpenAI for all AI functionality. The model is configurable via
 * OPENAI_MODEL so it can be tuned without a code change; the default is a
 * broadly available model that supports JSON responses, the web search tool,
 * and PDF file input.
 */

const DEFAULT_OPENAI_MODEL = "gpt-4o";

export const OPENAI_MODEL =
  process.env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL;

let cachedClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not set. Add it to your environment before generating AI content.",
    );
  }

  if (!cachedClient) {
    cachedClient = new OpenAI({ apiKey });
  }

  return cachedClient;
}

/**
 * Extract a JSON object substring from a model response. Tolerates ```json
 * fences and surrounding prose so behavior matches the previous implementation.
 */
export function extractJsonObject(text: string) {
  const fencedMatch = text.match(/```json\s*([\s\S]*?)```/i);
  const raw = fencedMatch?.[1] ?? text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI response did not contain valid JSON.");
  }

  return raw.slice(start, end + 1);
}

/**
 * Send a single text prompt and return the model's text output as a JSON
 * object string. Uses Chat Completions with a JSON response format; every
 * caller's prompt already instructs the model to return a JSON object.
 */
export async function completeJson(
  prompt: string,
  maxTokens: number,
): Promise<string> {
  const client = getOpenAIClient();

  const completion = await client.chat.completions.create({
    model: OPENAI_MODEL,
    max_tokens: maxTokens,
    response_format: { type: "json_object" },
    messages: [{ role: "user", content: prompt }],
  });

  return completion.choices[0]?.message?.content?.trim() ?? "";
}

/**
 * Run a prompt with the OpenAI web search tool and return the text output.
 */
export async function completeWithWebSearch(
  prompt: string,
  maxOutputTokens: number,
): Promise<string> {
  const client = getOpenAIClient();

  const response = await client.responses.create({
    model: OPENAI_MODEL,
    max_output_tokens: maxOutputTokens,
    tools: [{ type: "web_search_preview" }],
    input: prompt,
  });

  return (response.output_text ?? "").trim();
}

/**
 * Analyze a base64-encoded PDF alongside a text prompt and return the text
 * output.
 */
export async function analyzePdf(
  prompt: string,
  base64Pdf: string,
  filename: string,
  maxOutputTokens: number,
): Promise<string> {
  const client = getOpenAIClient();

  const response = await client.responses.create({
    model: OPENAI_MODEL,
    max_output_tokens: maxOutputTokens,
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_file",
            filename,
            file_data: `data:application/pdf;base64,${base64Pdf}`,
          },
          { type: "input_text", text: prompt },
        ],
      },
    ],
  });

  return (response.output_text ?? "").trim();
}
