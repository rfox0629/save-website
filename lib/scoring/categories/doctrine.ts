import type { NormalizedInquiry, NormalizedVetting } from "@/lib/scoring/types";
import {
  createComponent,
  createFlag,
  type CategoryScoreResult,
} from "@/lib/scoring/types";

export function scoreDoctrine(
  vetting: NormalizedVetting,
  inquiry: NormalizedInquiry,
): CategoryScoreResult {
  const scriptureScore =
    inquiry.scripture_position === "Inerrant"
      ? 4
      : inquiry.scripture_position === "Infallible"
        ? 3
        : inquiry.scripture_position === "Authoritative but not inerrant"
          ? 1
          : 0;
  const gospelScore =
    inquiry.gospel_clarity === "Faith alone in Christ alone"
      ? 5
      : inquiry.gospel_clarity === "Faith plus works"
        ? 0
        : inquiry.gospel_clarity
          ? 1
          : 0;
  const doctrinalStatementScore =
    inquiry.doctrinal_statement_public === "yes"
      ? 3
      : inquiry.doctrinal_statement_public === "on_request"
        ? 1
        : 0;
  const staffAffirmationScore = vetting.staff_doctrinal_affirmation ? 3 : 0;

  const flags = [];

  if (vetting.syncretism_practice && vetting.syncretism_practice !== "Never") {
    flags.push(
      createFlag(
        "medium",
        "doctrine",
        "syncretism_practice_present",
        "Syncretistic practices were disclosed and need reviewer follow-up.",
      ),
    );
  }

  if (inquiry.gospel_clarity === "Faith plus works") {
    flags.push(
      createFlag(
        "hard_stop",
        "doctrine",
        "faith_plus_works_gospel",
        "Inquiry responses indicate a gospel presentation grounded in faith plus works.",
      ),
    );
  }

  const components = [
    createComponent(
      "doctrine",
      "scripture_position",
      scriptureScore,
      4,
      inquiry.scripture_position ?? "Scripture position was not provided.",
    ),
    createComponent(
      "doctrine",
      "gospel_clarity",
      gospelScore,
      5,
      inquiry.gospel_clarity ?? "Gospel clarity was not provided.",
    ),
    createComponent(
      "doctrine",
      "doctrinal_statement_public",
      doctrinalStatementScore,
      3,
      inquiry.doctrinal_statement_public === "yes"
        ? "A public doctrinal statement was provided."
        : inquiry.doctrinal_statement_public === "on_request"
          ? "Doctrinal statement appears available on request."
          : "No public doctrinal statement was found.",
    ),
    createComponent(
      "doctrine",
      "staff_doctrinal_affirmation",
      staffAffirmationScore,
      3,
      vetting.staff_doctrinal_affirmation
        ? "Staff doctrinal affirmation is required."
        : "Staff doctrinal affirmation is not required or was not confirmed.",
    ),
  ];

  return {
    components,
    flags,
    max: 15,
    score: components.reduce(
      (sum, component) => sum + component.awarded_points,
      0,
    ),
  };
}
