/**
 * Two-or-three-way segmented control. Active segment fills with ink, inactive
 * are transparent. Used by Settings → Appearance for theme switching.
 */
export function SegmentedToggle({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div
      className="flex items-center gap-0.5 r-pill"
      style={{ background: "var(--bg-3)", padding: "2px" }}
    >
      {options.map((o) => {
        const active = o.id === value;
        return (
          <button
            type="button"
            key={o.id}
            onClick={() => onChange(o.id)}
            className="px-2.5 py-0.5 r-chip label-cap text-[9px] cursor-pointer transition-colors"
            style={{
              background: active ? "var(--ink)" : "transparent",
              color: active ? "var(--bg-0)" : "var(--ink-2)",
              letterSpacing: "0.14em",
              fontWeight: 700,
            }}
            aria-pressed={active}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
