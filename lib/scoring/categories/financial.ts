import type { NormalizedInquiry, NormalizedVetting } from "@/lib/scoring/types";
import {
  createComponent,
  createFlag,
  type CategoryScoreResult,
} from "@/lib/scoring/types";

export function scoreFinancial(
  vetting: NormalizedVetting,
  inquiry: NormalizedInquiry,
): CategoryScoreResult {
  const auditScore =
    inquiry.audit_level === "CPA audit"
      ? 6
      : inquiry.audit_level === "Review only"
        ? 3
        : inquiry.audit_level === "Compilation only"
          ? 1
          : 0;
  const programExpenseScore =
    (vetting.program_expense_pct ?? 0) >= 80
      ? 5
      : (vetting.program_expense_pct ?? 0) >= 70
        ? 3
        : (vetting.program_expense_pct ?? 0) >= 60
          ? 1
          : 0;
  const reserveScore =
    vetting.reserve_fund_level === "6–12 months"
      ? 4
      : vetting.reserve_fund_level === "3–6 months"
        ? 2
        : vetting.reserve_fund_level === "Less than 3 months"
          ? 1
          : 0;
  const restrictedFundsScore = vetting.restricted_funds_tracked ? 3 : 0;
  const budgetScore = inquiry.board_approved_budget ? 2 : 0;

  const flags = [];

  if (vetting.recent_deficit) {
    flags.push(
      createFlag(
        "medium",
        "financial",
        "recent_deficit",
        "A recent budget deficit was disclosed and should be reviewed.",
      ),
    );
  }

  if (vetting.restricted_funds_misused) {
    flags.push(
      createFlag(
        "hard_stop",
        "financial",
        "restricted_funds_misused",
        "Restricted funds were reported as misused.",
      ),
    );
  }

  const components = [
    createComponent(
      "financial",
      "audit_level",
      auditScore,
      6,
      inquiry.audit_level ?? "Audit level was not provided.",
    ),
    createComponent(
      "financial",
      "program_expense_pct",
      programExpenseScore,
      5,
      `Program expenses reported at ${vetting.program_expense_pct ?? 0}%.`,
    ),
    createComponent(
      "financial",
      "reserve_fund_level",
      reserveScore,
      4,
      vetting.reserve_fund_level ?? "Reserve fund level was not provided.",
    ),
    createComponent(
      "financial",
      "restricted_funds_tracked",
      restrictedFundsScore,
      3,
      vetting.restricted_funds_tracked
        ? "Restricted funds are tracked."
        : "Restricted funds tracking was not confirmed.",
    ),
    createComponent(
      "financial",
      "board_approved_budget",
      budgetScore,
      2,
      inquiry.board_approved_budget
        ? "Board approved budget is in place."
        : "Board-approved budget was not confirmed.",
    ),
  ];

  return {
    components,
    flags,
    max: 20,
    score: components.reduce(
      (sum, component) => sum + component.awarded_points,
      0,
    ),
  };
}
