import { useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "../lib/store";
import { PROTOCOLS } from "../lib/stages";
import { Settings, X, Trash2 } from "lucide-react";

export function SettingsPanel() {
  const setActivePanel = useStore((s) => s.setActivePanel);
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const resetData = useStore((s) => s.resetData);
  const protocol = useStore((s) => s.protocol);

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [customHours, setCustomHours] = useState(settings.customHours.toString());

  const handleProtocolChange = (id: string) => {
    updateSettings({ protocol: id });
    if (id !== "custom") {
      const proto = PROTOCOLS.find((p) => p.id === id);
      if (proto) updateSettings({ customHours: proto.hours });
    }
  };

  const handleCustomHoursChange = (val: string) => {
    setCustomHours(val);
    const hours = parseInt(val);
    if (!isNaN(hours) && hours > 0 && hours <= 168) {
      updateSettings({ customHours: hours, protocol: "custom" });
    }
  };

  const handleReset = () => {
    resetData();
    setShowResetConfirm(false);
  };

  return (
    <div className="w-full h-full flex flex-col p-4 gap-4 overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings size={14} className="text-white/50" />
          <span className="text-xs font-bold tracking-widest uppercase text-white/70">Settings</span>
        </div>
        <button
          onClick={() => setActivePanel("main")}
          className="p-1 rounded hover:bg-white/10 transition-colors"
        >
          <X size={14} className="text-white/40" />
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-y-auto scrollbar-hide">
        {/* Protocol */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] text-white/40 uppercase tracking-wider">Fasting Protocol</span>
          <div className="flex flex-col gap-1">
            {PROTOCOLS.map((proto) => (
              <button
                key={proto.id}
                onClick={() => handleProtocolChange(proto.id)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left"
                style={{
                  background:
                    protocol === proto.id ? "rgba(168,85,247,0.15)" : "rgba(255,255,255,0.04)",
                  border:
                    protocol === proto.id
                      ? "1px solid rgba(168,85,247,0.4)"
                      : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">{proto.name}</span>
                  <span className="text-[9px] text-white/40">{proto.description}</span>
                </div>
                {protocol === proto.id && (
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#a855f7" }} />
                )}
              </button>
            ))}
          </div>

          {protocol === "custom" && (
            <div className="flex items-center gap-2 px-2">
              <span className="text-[10px] text-white/50">Custom hours:</span>
              <input
                type="number"
                min="1"
                max="168"
                value={customHours}
                onChange={(e) => handleCustomHoursChange(e.target.value)}
                className="w-16 px-2 py-1 rounded text-xs font-mono text-white bg-white/10 border border-white/20 outline-none focus:border-purple-500"
              />
            </div>
          )}
        </div>

        {/* Sound */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white">Sound Effects</span>
            <span className="text-[9px] text-white/40">Level up and achievement sounds</span>
          </div>
          <button
            onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            className="w-10 h-5 rounded-full transition-all relative"
            style={{
              background: settings.soundEnabled ? "#a855f7" : "rgba(255,255,255,0.1)",
            }}
          >
            <motion.div
              className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
              animate={{ left: settings.soundEnabled ? "20px" : "2px" }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
        </div>

        {/* Reset */}
        <div className="mt-auto flex flex-col gap-2">
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all hover:bg-red-500/10 border border-red-500/20 text-red-400"
            >
              <Trash2 size={12} />
              Reset All Data
            </button>
          ) : (
            <div className="flex flex-col gap-2 rounded-lg p-3" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <span className="text-xs text-red-400 font-bold">This will delete ALL data.</span>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="flex-1 py-1.5 rounded text-[10px] font-bold bg-red-500 text-white"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-1.5 rounded text-[10px] font-bold bg-white/10 text-white/60"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
