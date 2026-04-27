import { useStore } from "../../lib/store";
import { STAGES } from "../../lib/stages";

/**
 * First milestone preview — only rendered in idle state.
 *
 * Shows the next metabolic transition the user will hit when they start their fast.
 * Example: "FIRST MILESTONE · Early Fast · glycogen depleting · 4h in".
 *
 * Builds the discipline narrative on the ready screen — not just "start a fast" but
 * "earn the next stage". STAGES[1] is the first transition past Fed (the always-on baseline).
 */
export function FirstMilestoneCard() {
  const isFasting = useStore((s) => s.isFasting);
  if (isFasting) return null;

  const firstStage = STAGES[1]; // Early Fast — first transition after starting

  return (
    <div
      className="flex items-center gap-2.5"
      style={{
        background: "var(--bg-1)",
        borderRadius: "var(--card-radius)",
        paddingInline: "var(--card-pad-x)",
        paddingBlock: "8px",
        border: "1px solid var(--hairline)",
      }}
    >
      <div
        className="flex-shrink-0 w-1.5 h-1.5 rounded-full"
        style={{
          background: firstStage.color,
          boxShadow: `0 0 6px ${firstStage.color}80`,
        }}
      />
      <div className="flex flex-col min-w-0 flex-1 leading-tight">
        <span className="label-cap text-[8px]" style={{ color: "var(--ink-3)" }}>
          First Milestone
        </span>
        <span className="text-[11px] truncate" style={{ color: "var(--ink)" }}>
          <span style={{ marginRight: "4px", fontWeight: 600, letterSpacing: "-0.005em" }}>
            {firstStage.name}
          </span>
          <span style={{ color: "var(--ink-3)" }}>· {firstStage.description.toLowerCase()}</span>
        </span>
      </div>
      <span className="font-mono text-[10px] flex-shrink-0" style={{ color: "var(--ink-2)" }}>
        {firstStage.hoursMin}h
        <span style={{ color: "var(--ink-4)" }}> in</span>
      </span>
    </div>
  );
}
