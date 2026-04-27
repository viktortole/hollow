import { motion, AnimatePresence } from "framer-motion";
import { invoke } from "@tauri-apps/api/core";
import { useStore } from "../lib/store";
import { useEscapeKey } from "../hooks/useEscapeKey";
import { Settings, BarChart2, Award, Pin, PinOff, Minimize2, EyeOff, X } from "lucide-react";
import type { AppState } from "../lib/store";

interface ContextMenuProps {
  position: { x: number; y: number } | null;
  onClose: () => void;
  onCloseWidget: () => void;
}

const menuItems = [
  { id: "stats", label: "Stats", icon: BarChart2 },
  { id: "achievements", label: "Achievements", icon: Award },
  { id: "settings", label: "Settings", icon: Settings },
] satisfies Array<{ id: AppState["activePanel"]; label: string; icon: typeof Settings }>;

export function ContextMenu({ position, onClose, onCloseWidget }: ContextMenuProps) {
  // Per-field selectors — destructuring the whole store would re-render this menu
  // on every store change in the entire app, including ticker updates.
  // Even narrower for `alwaysOnTop` specifically — ContextMenu only
  // reads that one field, no reason to re-render on theme/notify/sound flips.
  const alwaysOnTop = useStore((s) => s.settings.alwaysOnTop);
  const toggleAlwaysOnTop = useStore((s) => s.toggleAlwaysOnTop);
  const isPillMode = useStore((s) => s.isPillMode);
  const togglePillMode = useStore((s) => s.togglePillMode);
  const setActivePanel = useStore((s) => s.setActivePanel);

  useEscapeKey(!!position, onClose);

  if (!position) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed z-contextmenu"
        style={{ left: position.x, top: position.y }}
        initial={{ opacity: 0, scale: 0.95, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -4 }}
        transition={{ duration: 0.15 }}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <div
          className="flex flex-col r-card overflow-hidden"
          style={{
            background: "var(--bg-2)",
            boxShadow: "var(--shadow-popover)",
            minWidth: 168,
          }}
        >
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className="flex items-center gap-3 px-4 py-2.5 text-left hover:bg-soft transition-colors"
                onClick={() => {
                  setActivePanel(item.id);
                  onClose();
                }}
              >
                <Icon size={14} className="text-ink-3" />
                <span className="text-sm text-ink">{item.label}</span>
              </button>
            );
          })}

          <div className="h-px bg-soft" />

          <button
            className="flex items-center gap-3 px-4 py-2.5 text-left hover:bg-soft transition-colors"
            onClick={() => {
              toggleAlwaysOnTop();
              onClose();
            }}
          >
            {alwaysOnTop ? <PinOff size={14} className="text-ink-3" /> : <Pin size={14} className="text-ink-3" />}
            <span className="text-sm text-ink">
              {alwaysOnTop ? "Unpin (Not Always On Top)" : "Pin (Always On Top)"}
            </span>
          </button>

          <button
            className="flex items-center gap-3 px-4 py-2.5 text-left hover:bg-soft transition-colors"
            onClick={() => {
              togglePillMode();
              onClose();
            }}
          >
            <Minimize2 size={14} className="text-ink-3" />
            <span className="text-sm text-ink">
              {isPillMode ? "Expand Widget" : "Pill Mode"}
            </span>
          </button>

          <div className="h-px bg-soft" />

          <button
            className="flex items-center gap-3 px-4 py-2.5 text-left hover:bg-soft transition-colors"
            onClick={() => {
              onCloseWidget(); // hide to tray
              onClose();
            }}
          >
            <EyeOff size={14} className="text-ink-3" />
            <span className="text-sm text-ink">Hide to Tray</span>
          </button>

          <button
            className="flex items-center gap-3 px-4 py-2.5 text-left hover:bg-soft transition-colors"
            onClick={async () => {
              onClose();
              try {
                await invoke("quit_app");
              } catch {
                // Fallback: window.close may not exit the process but is best-effort
                window.close();
              }
            }}
          >
            <X size={14} className="text-ink-3" />
            <span className="text-sm text-ink">Quit</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
