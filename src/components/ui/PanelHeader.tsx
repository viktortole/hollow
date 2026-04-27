import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

interface PanelHeaderProps {
  /** Lucide icon (sized externally) shown to the right of the back button. */
  icon: ReactNode;
  /** Heading text — displayed in `label-cap` style. */
  title: string;
  /** Called when the back arrow is clicked. */
  onBack: () => void;
  /** Optional element rendered at the far right (e.g. a counter chip). */
  trailing?: ReactNode;
}

/**
 * Standard panel header — `← icon TITLE [trailing]`.
 *
 * Used by Settings, Stats, and Achievements. Replaced 3 nearly-identical
 * inline JSX blocks. New panels should compose this — never hand-roll a back
 * button.
 */
export function PanelHeader({ icon, title, onBack, trailing }: PanelHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="w-6 h-6 flex items-center justify-center cursor-pointer rounded transition-colors"
          style={{ color: "var(--ink-3)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-3)")}
          aria-label="Back"
        >
          <ArrowLeft size={14} />
        </button>
        {icon}
        <span
          className="label-cap text-[11px]"
          style={{ color: "var(--ink)", letterSpacing: "0.22em", fontWeight: 600 }}
        >
          {title}
        </span>
      </div>
      {trailing && <div className="flex-shrink-0">{trailing}</div>}
    </div>
  );
}
