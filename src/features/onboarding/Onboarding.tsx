import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { PROTOCOLS, STAGES } from "../../lib/stages";
import { useStore } from "../../lib/store";

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
              <circle cx="24" cy="24" r="20" stroke="#d97757" strokeWidth="1.5" opacity="0.3" />
              <circle cx="24" cy="24" r="14" stroke="#d97757" strokeWidth="1.5" opacity="0.5" />
              <circle cx="24" cy="24" r="8" fill="#d97757" opacity="0.85" />
              <circle cx="24" cy="24" r="3" fill="var(--bg-0)" />
            </svg>
          </motion.div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-ink tracking-[0.3em]">HOLLOW</h1>
            <p className="text-xs text-ink-3 mt-1 tracking-wide">
              Your fasting journey, transformed
            </p>
          </div>
          <div className="text-[10px] text-ink-4 text-center max-w-[200px] leading-relaxed">
            Track intermittent fasts. Earn XP. Unlock achievements. Become disciplined.
          </div>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="mt-2 px-7 py-3 text-sm font-bold tracking-widest uppercase transition-all hover:scale-105 active:scale-95 cursor-pointer"
            style={{
              background: "var(--ember)",
              color: "var(--bg-0)",
              letterSpacing: "0.18em",
              borderRadius: "2px",
              minHeight: "44px",
              boxShadow: "0 8px 20px rgba(184,90,59,0.32), 0 1px 0 rgba(255,255,255,0.18) inset",
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
            <h2 className="text-sm font-bold text-ink tracking-widest uppercase">
              Choose Your Protocol
            </h2>
            <p className="text-[10px] text-ink-3 mt-1">
              You can always change this later
            </p>
          </div>

          <div className="w-full flex flex-col gap-2 max-h-[180px] overflow-y-auto scrollbar-hide">
            {PROTOCOLS.filter((p) => p.id !== "custom").map((proto) => (
              <button
                type="button"
                key={proto.id}
                onClick={() => setSelectedProtocol(proto.id)}
                className="w-full flex items-center justify-between px-3 py-2 r-card transition-all"
                style={{
                  background:
                    selectedProtocol === proto.id
                      ? "var(--sel-bg)"
                      : "var(--bg-3)",
                  borderRadius: "var(--card-radius)",
                  paddingInline: "var(--card-pad-x)",
                  paddingBlock: "var(--card-pad-y)",
                }}
              >
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-sm font-bold text-ink">{proto.name}</span>
                  <span className="text-[10px] text-ink-3">{proto.description}</span>
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

          {/* Stages preview — shows what the user will experience metabolically. Only stages reachable in selected protocol get color; rest are dimmed. */}
          <div className="w-full flex flex-col gap-1.5 mt-1" aria-label="Metabolic stages preview">
            <div className="flex items-center justify-between px-1">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-ink-3">Stages You'll Reach</span>
              <span className="text-[9px] text-ink-4 font-mono">
                {(() => {
                  const protoHours = PROTOCOLS.find(p => p.id === selectedProtocol)?.hours ?? 16;
                  const reached = STAGES.filter(s => s.hoursMin < protoHours).length;
                  return `${reached} / ${STAGES.length}`;
                })()}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {STAGES.map((s) => {
                const protoHours = PROTOCOLS.find(p => p.id === selectedProtocol)?.hours ?? 16;
                const reachable = s.hoursMin < protoHours;
                return (
                  <div
                    key={s.id}
                    className="flex-1 h-1.5 rounded-full transition-all"
                    style={{
                      background: reachable ? s.color : "var(--hairline)",
                      opacity: reachable ? 0.85 : 1,
                      boxShadow: reachable ? `0 0 6px ${s.color}80` : "none",
                    }}
                    title={`${s.name} — starts at ${s.hoursMin}h`}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-between px-1 text-[8px] text-ink-4 font-mono uppercase tracking-wider">
              <span>0h</span>
              <span>48h+</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleComplete}
            className="mt-2 flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold tracking-widest uppercase transition-all hover:scale-105 active:scale-95"
            style={{
              background: "var(--ember)",
              color: "var(--bg-0)",
              letterSpacing: "0.18em",
              borderRadius: "2px",
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
