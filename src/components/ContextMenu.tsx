import { motion, AnimatePresence } from "framer-motion";
import { invoke } from "@tauri-apps/api/core";
import { useStore } from "../lib/store";
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
  const { settings, toggleAlwaysOnTop, isPillMode, togglePillMode } = useStore();
  const setActivePanel = useStore((s) => s.setActivePanel);

  if (!position) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed z-[100]"
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
          className="flex flex-col rounded-xl overflow-hidden"
          style={{
            background: "rgba(15,15,25,0.98)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            minWidth: 160,
          }}
        >
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className="flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5 transition-colors"
                onClick={() => {
                  setActivePanel(item.id);
                  onClose();
                }}
              >
                <Icon size={14} className="text-white/50" />
                <span className="text-sm text-white/80">{item.label}</span>
              </button>
            );
          })}

          <div className="h-px bg-white/10" />

          <button
            className="flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5 transition-colors"
            onClick={() => {
              toggleAlwaysOnTop();
              onClose();
            }}
          >
            {settings.alwaysOnTop ? <PinOff size={14} className="text-white/50" /> : <Pin size={14} className="text-white/50" />}
            <span className="text-sm text-white/80">
              {settings.alwaysOnTop ? "Unpin (Not Always On Top)" : "Pin (Always On Top)"}
            </span>
          </button>

          <button
            className="flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5 transition-colors"
            onClick={() => {
              togglePillMode();
              onClose();
            }}
          >
            <Minimize2 size={14} className="text-white/50" />
            <span className="text-sm text-white/80">
              {isPillMode ? "Expand Widget" : "Pill Mode"}
            </span>
          </button>

          <div className="h-px bg-white/10" />

          <button
            className="flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5 transition-colors"
            onClick={() => {
              onCloseWidget(); // hide to tray
              onClose();
            }}
          >
            <EyeOff size={14} className="text-white/50" />
            <span className="text-sm text-white/80">Hide to Tray</span>
          </button>

          <button
            className="flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5 transition-colors"
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
            <X size={14} className="text-white/50" />
            <span className="text-sm text-white/80">Quit</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
