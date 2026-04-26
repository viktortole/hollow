import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { PROTOCOLS } from "../lib/stages";
import { useStore } from "../lib/store";

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [selectedProtocol, setSelectedProtocol] = useState("16_8");
  const updateSettings = useStore((s) => s.updateSettings);
  const setActivePanel = useStore((s) => s.setActivePanel);

  const handleComplete = () => {
    onComplete();
    updateSettings({ protocol: selectedProtocol });
    setActivePanel("main");
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center overflow-hidden"
      style={{ paddingInline: "var(--widget-pad-x)", paddingBlock: "var(--widget-pad-y)", gap: "var(--card-gap)" }}>
      <AnimatePresence mode="wait">
        {step === 0 ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            className="flex flex-col items-center gap-4 w-full"
          >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="#a855f7" strokeWidth="2" opacity="0.3" />
              <circle cx="24" cy="24" r="14" stroke="#a855f7" strokeWidth="2" opacity="0.5" />
              <circle cx="24" cy="24" r="8" fill="#a855f7" opacity="0.8" />
              <circle cx="24" cy="24" r="4" fill="#fff" />
            </svg>
          </motion.div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-white tracking-[0.3em]">HOLLOW</h1>
            <p className="text-xs text-white/40 mt-1 tracking-wide">
              Your fasting journey, transformed
            </p>
          </div>
          <div className="text-[10px] text-white/30 text-center max-w-[200px] leading-relaxed">
            Track intermittent fasts. Earn XP. Unlock achievements. Become disciplined.
          </div>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="mt-2 px-6 py-2 rounded-full text-sm font-bold tracking-widest uppercase transition-all hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #a855f7, #ec4899)",
              color: "#fff",
              letterSpacing: "0.15em",
            }}
          >
            Begin
          </button>
          </motion.div>
        ) : (
          <motion.div
            key="protocol"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            className="flex flex-col items-center gap-4 w-full"
          >
          <div className="text-center mb-2">
            <h2 className="text-sm font-bold text-white tracking-widest uppercase">
              Choose Your Protocol
            </h2>
            <p className="text-[10px] text-white/40 mt-1">
              You can always change this later
            </p>
          </div>

          <div className="w-full flex flex-col gap-2 max-h-[180px] overflow-y-auto scrollbar-hide">
            {PROTOCOLS.filter((p) => p.id !== "custom").map((proto) => (
              <button
                type="button"
                key={proto.id}
                onClick={() => setSelectedProtocol(proto.id)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all"
                style={{
                  background:
                    selectedProtocol === proto.id
                      ? "var(--sel-bg)"
                      : "rgba(255,255,255,0.04)",
                  borderRadius: "var(--card-radius)",
                  paddingInline: "var(--card-pad-x)",
                  paddingBlock: "var(--card-pad-y)",
                }}
              >
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-sm font-bold text-white">{proto.name}</span>
                  <span className="text-[10px] text-white/40">{proto.description}</span>
                </div>
                {selectedProtocol === proto.id && (
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: "var(--sel-dot)", boxShadow: "0 0 8px var(--sel-dot)" }}
                  />
                )}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleComplete}
            className="mt-2 flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold tracking-widest uppercase transition-all hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #a855f7, #ec4899)",
              color: "#fff",
              letterSpacing: "0.15em",
            }}
          >
            Start Fasting
            <ChevronRight size={14} />
          </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
