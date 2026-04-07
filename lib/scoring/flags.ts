import type { EngineRiskFlag } from "@/lib/scoring/types";

export function compileFlags(flags: EngineRiskFlag[]) {
  const hardStopFlags = flags.filter((flag) => flag.severity === "hard_stop");

  return {
    flags,
    hard_stop_reason:
      hardStopFlags.length > 0
        ? hardStopFlags.map((flag) => flag.description).join("; ")
        : null,
    is_hard_stop: hardStopFlags.length > 0,
  };
}
