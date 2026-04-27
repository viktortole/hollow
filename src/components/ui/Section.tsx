import type { ReactNode } from "react";

/**
 * Labelled vertical group used by Settings and any future panel that lays out
 * collections of rows under a small-cap heading.
 */
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span
        className="label-cap text-[8.5px] px-1"
        style={{ color: "var(--ink-3)", letterSpacing: "0.22em" }}
      >
        {title}
      </span>
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  );
}
