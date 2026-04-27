import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { useStore } from "../../lib/store";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import { PROTOCOLS } from "../../lib/stages";

/**
 * Inline protocol picker — only rendered in idle state.
 *
 * Clickable chip that opens a popover with the full PROTOCOLS list.
 * Custom protocol surfaces a number input so users can dial in any 1-168 hour
 * window without leaving the main widget. This is the "make 16:8 customizable"
 * answer — quick switch from the home screen, no Settings round-trip.
 */
export function ProtocolPicker() {
  const isFasting = useStore((s) => s.isFasting);
  const protocol = useStore((s) => s.protocol);
  // Narrow selector — ProtocolPicker only needs the customHours slot, not the
  // whole settings object. Saves a re-render on every theme/notify/sound flip.
  const customHours = useStore((s) => s.settings.customHours);
  const updateSettings = useStore((s) => s.updateSettings);

  const [open, setOpen] = useState(false);
  const [customDraft, setCustomDraft] = useState(customHours.toString());

  useEscapeKey(open, () => setOpen(false));

  if (isFasting) return null;

  const current = PROTOCOLS.find((p) => p.id === protocol) ?? PROTOCOLS[0];

  const pick = (id: string) => {
    updateSettings({ protocol: id });
    if (id !== "custom") {
      const proto = PROTOCOLS.find((p) => p.id === id);
      if (proto) updateSettings({ customHours: proto.hours });
    }
    if (id !== "custom") setOpen(false);
  };

  const commitCustom = () => {
    const hours = parseInt(customDraft, 10);
    if (!isNaN(hours) && hours > 0 && hours <= 168) {
      updateSettings({ customHours: hours, protocol: "custom" });
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 cursor-pointer transition-colors focus:outline-none"
        style={{
          background: "var(--bg-2)",
          borderRadius: "var(--card-radius)",
          paddingInline: "var(--card-pad-x)",
          paddingBlock: "9px",
          boxShadow: "var(--shadow-card)",
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Selected protocol ${current.name}. Click to change.`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="label-cap text-[8.5px] flex-shrink-0"
            style={{ color: "var(--ink-3)", letterSpacing: "0.18em" }}
          >
            Protocol
          </span>
          <span
            className="font-mono text-[12px] font-bold flex-shrink-0"
            style={{ color: "var(--ink)", letterSpacing: "0.02em" }}
          >
            {current.name}
          </span>
          <span className="text-[9.5px] truncate" style={{ color: "var(--ink-3)" }}>
            {current.description}
          </span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.18 }}>
          <ChevronDown size={12} style={{ color: "var(--ink-3)" }} />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop — close on click outside the popover */}
            <div
              className="fixed inset-0 z-overlay"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.div
              role="listbox"
              className="absolute left-0 right-0 z-popover mt-1 overflow-hidden"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              style={{
                background: "var(--bg-2)",
                borderRadius: "var(--card-radius)",
                boxShadow: "var(--shadow-popover)",
                maxHeight: "260px",
                overflowY: "auto",
              }}
            >
              {PROTOCOLS.map((proto) => {
                const selected = protocol === proto.id;
                return (
                  <button
                    key={proto.id}
                    role="option"
                    aria-selected={selected}
                    onClick={() => pick(proto.id)}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 cursor-pointer text-left transition-colors"
                    style={{
                      background: selected ? "var(--bg-3)" : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!selected) e.currentTarget.style.background = "var(--bg-3)";
                    }}
                    onMouseLeave={(e) => {
                      if (!selected) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <div className="flex flex-col min-w-0">
                      <span
                        className="font-mono text-[11px] font-bold"
                        style={{ color: "var(--ink)", letterSpacing: "0.02em" }}
                      >
                        {proto.name}
                      </span>
                      <span className="text-[9.5px] truncate" style={{ color: "var(--ink-3)" }}>
                        {proto.description}
                      </span>
                    </div>
                    {selected && (
                      <Check size={12} style={{ color: "var(--ember)", flexShrink: 0 }} />
                    )}
                  </button>
                );
              })}

              {protocol === "custom" && (
                <div
                  className="flex items-center gap-2 px-3 py-2"
                  style={{ borderTop: "1px solid var(--hairline)" }}
                >
                  <span className="label-cap text-[8.5px]" style={{ color: "var(--ink-3)", letterSpacing: "0.18em" }}>
                    Hours
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={168}
                    value={customDraft}
                    onChange={(e) => setCustomDraft(e.target.value)}
                    onBlur={commitCustom}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        commitCustom();
                        setOpen(false);
                      }
                    }}
                    className="w-16 px-2 py-1 r-chip font-mono text-[11px] outline-none focus:ring-1 focus:ring-orange-300/40"
                    style={{
                      background: "var(--bg-3)",
                      color: "var(--ink)",
                      border: "1px solid var(--hairline)",
                    }}
                    aria-label="Custom hours, 1 to 168"
                  />
                  <span className="text-[9.5px]" style={{ color: "var(--ink-3)" }}>
                    1–168 hours
                  </span>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
