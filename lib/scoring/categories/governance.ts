import type { NormalizedVetting } from "@/lib/scoring/types";
import {
  createComponent,
  createFlag,
  type CategoryScoreResult,
} from "@/lib/scoring/types";

function scoreIndependentBoard(
  independentBoardCount: number | null,
  boardSize: number | null,
) {
  if (!independentBoardCount || !boardSize || boardSize <= 0) {
    return 0;
  }

  const minimumMajority = Math.floor(boardSize / 2) + 1;

  if (independentBoardCount > minimumMajority) {
    return 5;
  }

  if (independentBoardCount === minimumMajority) {
    return 3;
  }

  return 0;
}

export function scoreGovernance(
  vetting: NormalizedVetting,
): CategoryScoreResult {
  const independentBoardScore = scoreIndependentBoard(
    vetting.independent_board_count,
    vetting.board_size,
  );
  const meetingScore =
    vetting.board_meeting_frequency === "Monthly" ||
    vetting.board_meeting_frequency === "Quarterly"
      ? 3
      : vetting.board_meeting_frequency === "Semi-annually"
        ? 1
        : 0;
  const conflictScore = vetting.conflict_of_interest_policy ? 3 : 0;
  const whistleblowerScore = vetting.whistleblower_policy ? 2 : 0;
  const reviewScore = vetting.annual_ed_review ? 2 : 0;

  const flags = [];

  if (vetting.family_on_board) {
    flags.push(
      createFlag(
        "medium",
        "governance",
        "family_on_board",
        "Family relationships on the board may weaken independence and should be reviewed.",
      ),
    );
  }

  if (vetting.board_meeting_frequency === "Irregularly") {
    flags.push(
      createFlag(
        "high",
        "governance",
        "irregular_board_meetings",
        "Board meeting cadence is irregular.",
      ),
    );
  }

  const components = [
    createComponent(
      "governance",
      "independent_board_count",
      independentBoardScore,
      5,
      vetting.board_size
        ? `${vetting.independent_board_count ?? 0} of ${vetting.board_size} board members are independent.`
        : "Board size was not available for independence scoring.",
    ),
    createComponent(
      "governance",
      "board_meeting_frequency",
      meetingScore,
      3,
      vetting.board_meeting_frequency ??
        "Board meeting frequency was not provided.",
    ),
    createComponent(
      "governance",
      "conflict_of_interest_policy",
      conflictScore,
      3,
      vetting.conflict_of_interest_policy
        ? "A conflict of interest policy is in place."
        : "No conflict of interest policy was confirmed.",
    ),
    createComponent(
      "governance",
      "whistleblower_policy",
      whistleblowerScore,
      2,
      vetting.whistleblower_policy
        ? "A whistleblower policy is in place."
        : "No whistleblower policy was confirmed.",
    ),
    createComponent(
      "governance",
      "annual_ed_review",
      reviewScore,
      2,
      vetting.annual_ed_review
        ? "An annual executive director review occurs."
        : "No annual executive director review was confirmed.",
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
