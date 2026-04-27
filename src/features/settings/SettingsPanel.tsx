import { useState } from "react";
import { useStore } from "../../lib/store";
import { PROTOCOLS } from "../../lib/stages";
import { Section, Row, Toggle, Stepper, SegmentedToggle, PanelHeader } from "../../components/ui";
import {
  Award,
  Bell,
  Check,
  Download,
  Droplet,
  Minus,
  Moon,
  Pin,
  Plus,
  Settings as SettingsIcon,
  Smile,
  Sparkles,
  Sun,
  Trash2,
  TrendingUp,
  Upload,
  Volume2,
  VolumeX,
} from "lucide-react";

/**
 * Settings panel — every persisted preference, grouped into sections.
 *
 * Sections:
 *   1. Fasting       — protocol selector + custom hours
 *   2. Hydration     — daily glasses goal
 *   3. Appearance    — theme toggle
 *   4. Window        — always-on-top
 *   5. Sound         — master sound toggle
 *   6. Notifications — per-type celebration toggles + mood prompt
 *   7. Data          — destructive reset
 *
 * Use SectionHeader, Row, Toggle, Stepper, Pill primitives below for visual
 * consistency. No inline styling drift.
 */
export function SettingsPanel() {
  const setActivePanel = useStore((s) => s.setActivePanel);
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const resetData = useStore((s) => s.resetData);
  const exportData = useStore((s) => s.exportData);
  const importData = useStore((s) => s.importData);
  const protocol = useStore((s) => s.protocol);
  const hydrationGoalGlasses = useStore((s) => s.hydrationGoalGlasses);
  const setHydrationGoal = useStore((s) => s.setHydrationGoal);
  const toggleAlwaysOnTop = useStore((s) => s.toggleAlwaysOnTop);

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [customHours, setCustomHours] = useState(settings.customHours.toString());
  const [importMessage, setImportMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [protocolsExpanded, setProtocolsExpanded] = useState(false);

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().split("T")[0];
    a.href = url;
    a.download = `hollow-backup-${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setImportMessage({ ok: true, text: "Backup downloaded." });
    setTimeout(() => setImportMessage(null), 3000);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      const result = importData(text);
      if (result.ok) {
        setImportMessage({ ok: true, text: "Backup restored." });
      } else {
        setImportMessage({ ok: false, text: result.error });
      }
      setTimeout(() => setImportMessage(null), 4000);
    };
    reader.onerror = () => setImportMessage({ ok: false, text: "Could not read file." });
    reader.readAsText(file);
    // Reset input so re-selecting the same file fires onChange.
    e.target.value = "";
  };

  const handleProtocolChange = (id: string) => {
    updateSettings({ protocol: id });
    if (id !== "custom") {
      const proto = PROTOCOLS.find((p) => p.id === id);
      if (proto) updateSettings({ customHours: proto.hours });
    }
  };

  const handleCustomHoursChange = (val: string) => {
    setCustomHours(val);
    const hours = parseInt(val, 10);
    if (!isNaN(hours) && hours > 0 && hours <= 168) {
      updateSettings({ customHours: hours, protocol: "custom" });
    }
  };

  return (
    <div
      className="w-full h-full flex flex-col overflow-hidden"
      style={{
        paddingInline: "var(--widget-pad-x)",
        paddingBlock: "var(--widget-pad-y)",
        gap: "10px",
      }}
    >
      <PanelHeader
        icon={<SettingsIcon size={13} style={{ color: "var(--ink-3)" }} />}
        title="Settings"
        onBack={() => setActivePanel("main")}
      />

      <div className="flex-1 flex flex-col gap-4 overflow-y-auto scrollbar-hide pr-0.5">
        {/* FASTING — collapsible. Default shows ONLY the selected protocol so
            the user can scroll past to Hydration/Notifications/Data without
            wading through 8 cards every time (audit #12). */}
        <Section title="Fasting">
          <div className="flex flex-col gap-1">
            {PROTOCOLS.filter((p) => protocolsExpanded || protocol === p.id).map((p) => {
              const selected = protocol === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleProtocolChange(p.id)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 cursor-pointer text-left transition-colors"
                  style={{
                    background: selected ? "var(--bg-3)" : "var(--bg-2)",
                    borderRadius: "var(--card-radius)",
                    boxShadow: selected ? undefined : "var(--shadow-card)",
                    border: selected ? "1px solid var(--ember)" : "1px solid transparent",
                  }}
                  aria-pressed={selected}
                >
                  <div className="flex flex-col min-w-0">
                    <span
                      className="font-mono text-[11px] font-bold"
                      style={{ color: "var(--ink)" }}
                    >
                      {p.name}
                    </span>
                    <span className="text-[9.5px] truncate" style={{ color: "var(--ink-3)" }}>
                      {p.description}
                    </span>
                  </div>
                  {selected && <Check size={12} style={{ color: "var(--ember)" }} />}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setProtocolsExpanded((v) => !v)}
              className="flex items-center justify-center gap-1 py-1.5 cursor-pointer label-cap text-[9px]"
              style={{ color: "var(--ink-3)", letterSpacing: "0.18em" }}
              aria-expanded={protocolsExpanded}
            >
              {protocolsExpanded
                ? "Show less"
                : `Show all ${PROTOCOLS.length} protocols`}
              <span style={{ color: "var(--ink-4)" }}>{protocolsExpanded ? "▴" : "▾"}</span>
            </button>
            {protocol === "custom" && (
              <div
                className="flex items-center gap-2 px-3 py-2 mt-1"
                style={{
                  background: "var(--bg-2)",
                  borderRadius: "var(--card-radius)",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                <span
                  className="label-cap text-[8.5px]"
                  style={{ color: "var(--ink-3)", letterSpacing: "0.18em" }}
                >
                  Hours
                </span>
                <input
                  type="number"
                  min={1}
                  max={168}
                  value={customHours}
                  onChange={(e) => handleCustomHoursChange(e.target.value)}
                  className="w-16 px-2 py-1 r-chip font-mono text-[11px] outline-none focus:ring-1 focus:ring-orange-300/40"
                  style={{
                    background: "var(--bg-3)",
                    color: "var(--ink)",
                    border: "1px solid var(--hairline)",
                  }}
                  aria-label="Custom hours"
                />
                <span className="text-[9.5px]" style={{ color: "var(--ink-3)" }}>
                  1–168
                </span>
              </div>
            )}
          </div>
        </Section>

        {/* HYDRATION */}
        <Section title="Hydration">
          <Row
            icon={<Droplet size={13} style={{ color: "var(--water)" }} fill="var(--water)" fillOpacity={0.4} />}
            title="Daily Goal"
            sub="Glasses of water per day"
          >
            <Stepper
              value={hydrationGoalGlasses}
              min={1}
              max={20}
              onDec={() => setHydrationGoal(hydrationGoalGlasses - 1)}
              onInc={() => setHydrationGoal(hydrationGoalGlasses + 1)}
            />
          </Row>
        </Section>

        {/* APPEARANCE */}
        <Section title="Appearance">
          <Row
            icon={
              settings.theme === "dark" ? (
                <Moon size={13} style={{ color: "var(--ink-2)" }} />
              ) : (
                <Sun size={13} style={{ color: "var(--ember)" }} />
              )
            }
            title="Theme"
            sub={settings.theme === "dark" ? "Warm graphite + cream ink" : "Architectural cream"}
          >
            <SegmentedToggle
              options={[
                { id: "light", label: "Light" },
                { id: "dark", label: "Dark" },
              ]}
              value={settings.theme}
              onChange={(id) => updateSettings({ theme: id as "light" | "dark" })}
            />
          </Row>
        </Section>

        {/* WINDOW */}
        <Section title="Window">
          <Row
            icon={<Pin size={13} style={{ color: "var(--ink-2)" }} />}
            title="Always On Top"
            sub="Pin Hollow above other windows"
          >
            <Toggle value={settings.alwaysOnTop} onToggle={toggleAlwaysOnTop} />
          </Row>
        </Section>

        {/* SOUND */}
        <Section title="Sound">
          <Row
            icon={
              settings.soundEnabled ? (
                <Volume2 size={13} style={{ color: "var(--ember)" }} />
              ) : (
                <VolumeX size={13} style={{ color: "var(--ink-3)" }} />
              )
            }
            title="Master Sound"
            sub="Level-up + achievement chimes"
          >
            <Toggle
              value={settings.soundEnabled}
              onToggle={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            />
          </Row>
        </Section>

        {/* NOTIFICATIONS */}
        <Section title="Notifications">
          <Row
            icon={<TrendingUp size={13} style={{ color: "var(--gold)" }} />}
            title="Level-Up Toasts"
            sub="When you earn a new rank"
          >
            <Toggle
              value={settings.notifyLevelUp}
              onToggle={() => updateSettings({ notifyLevelUp: !settings.notifyLevelUp })}
            />
          </Row>
          <Row
            icon={<Award size={13} style={{ color: "var(--gold)" }} />}
            title="Achievement Toasts"
            sub="On milestone unlocks"
          >
            <Toggle
              value={settings.notifyAchievement}
              onToggle={() => updateSettings({ notifyAchievement: !settings.notifyAchievement })}
            />
          </Row>
          <Row
            icon={<Sparkles size={13} style={{ color: "var(--ember)" }} />}
            title="Stage-Up Toasts"
            sub="On metabolic transitions"
          >
            <Toggle
              value={settings.notifyStageUp}
              onToggle={() => updateSettings({ notifyStageUp: !settings.notifyStageUp })}
            />
          </Row>
          <Row
            icon={<Bell size={13} style={{ color: "var(--water)" }} />}
            title="Hydration Goal Toast"
            sub="Once per day when target met"
          >
            <Toggle
              value={settings.notifyHydrationGoal}
              onToggle={() => updateSettings({ notifyHydrationGoal: !settings.notifyHydrationGoal })}
            />
          </Row>
          <Row
            icon={<Smile size={13} style={{ color: "var(--success)" }} />}
            title="Mood Prompt"
            sub="Rate how a fast felt afterward"
          >
            <Toggle
              value={settings.promptMood}
              onToggle={() => updateSettings({ promptMood: !settings.promptMood })}
            />
          </Row>
        </Section>

        {/* DATA */}
        <Section title="Data">
          {/* Export + Import — JSON backup. Local file only; no cloud, no telemetry. */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 cursor-pointer transition-colors"
              style={{
                background: "var(--bg-2)",
                color: "var(--ink-2)",
                borderRadius: "var(--card-radius)",
                boxShadow: "var(--shadow-card)",
              }}
              aria-label="Export backup as JSON file"
              title="Download a JSON backup of everything"
            >
              <Download size={11} />
              <span className="label-cap text-[9.5px]" style={{ letterSpacing: "0.16em", fontWeight: 700 }}>
                Export
              </span>
            </button>
            <label
              className="flex-1 flex items-center justify-center gap-1.5 py-2 cursor-pointer transition-colors"
              style={{
                background: "var(--bg-2)",
                color: "var(--ink-2)",
                borderRadius: "var(--card-radius)",
                boxShadow: "var(--shadow-card)",
              }}
              title="Restore from a JSON backup file"
            >
              <Upload size={11} />
              <span className="label-cap text-[9.5px]" style={{ letterSpacing: "0.16em", fontWeight: 700 }}>
                Import
              </span>
              <input
                type="file"
                accept="application/json,.json"
                onChange={handleImportFile}
                className="hidden"
                aria-label="Import backup JSON file"
              />
            </label>
          </div>
          {importMessage && (
            <div
              className="text-[10px] px-2 py-1.5 r-card"
              style={{
                background: importMessage.ok ? "var(--ember-soft)" : "var(--bg-3)",
                color: importMessage.ok ? "var(--ember)" : "var(--danger)",
                fontWeight: 600,
              }}
              role="status"
            >
              {importMessage.text}
            </div>
          )}
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center justify-center gap-2 py-2.5 cursor-pointer transition-colors hover-danger-soft"
              style={{
                background: "var(--bg-2)",
                color: "var(--danger)",
                borderRadius: "var(--card-radius)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <Trash2 size={12} />
              <span
                className="label-cap text-[10px]"
                style={{ letterSpacing: "0.18em", fontWeight: 700 }}
              >
                Reset All Data
              </span>
            </button>
          ) : (
            <div
              className="flex flex-col gap-2 p-3"
              style={{
                background: "var(--ember-soft)",
                borderRadius: "var(--card-radius)",
                border: "1px solid var(--danger)",
              }}
            >
              <span
                className="text-[11px] font-bold"
                style={{ color: "var(--danger)" }}
              >
                Permanently delete every fast, achievement, and setting?
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    resetData();
                    setShowResetConfirm(false);
                  }}
                  className="flex-1 py-1.5 cursor-pointer label-cap text-[10px]"
                  style={{
                    background: "var(--danger)",
                    color: "var(--bg-0)",
                    borderRadius: "var(--card-radius)",
                    letterSpacing: "0.16em",
                    fontWeight: 700,
                  }}
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-1.5 cursor-pointer label-cap text-[10px]"
                  style={{
                    background: "var(--bg-3)",
                    color: "var(--ink-2)",
                    borderRadius: "var(--card-radius)",
                    letterSpacing: "0.16em",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </Section>

        {/* ABOUT */}
        <div className="mt-2 mb-1 flex items-center justify-between">
          <span className="label-cap text-[8px]" style={{ color: "var(--ink-3)", letterSpacing: "0.22em" }}>
            Hollow
          </span>
          <span className="font-mono text-[9px]" style={{ color: "var(--ink-3)" }}>
            v1.0.0 · Tauri 2
          </span>
        </div>
      </div>
    </div>
  );
}

