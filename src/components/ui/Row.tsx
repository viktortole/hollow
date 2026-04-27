import type { ReactNode } from "react";

/**
 * Setting row — icon + title/sub stack on the left, control on the right.
 * Primary card surface (var(--bg-2) + var(--shadow-card)) so it reads as an
 * actionable grouping, not text.
 */
export function Row({
  icon,
  title,
  sub,
  children,
}: {
  icon: ReactNode;
  title: string;
  sub: string;
  children: ReactNode;
}) {
  return (
    <div
      className="flex items-center justify-between gap-3 px-3 py-2"
      style={{
        background: "var(--bg-2)",
        borderRadius: "var(--card-radius)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="flex-shrink-0">{icon}</span>
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] font-bold truncate" style={{ color: "var(--ink)" }}>
            {title}
          </span>
          <span className="text-[9px] truncate" style={{ color: "var(--ink-3)" }}>
            {sub}
          </span>
        </div>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}
