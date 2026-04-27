import type { ReactNode } from "react";
import { useStore } from "../lib/store";
import { isMobile } from "../platform";

interface NavButtonProps {
  onClick: () => void;
  ariaLabel: string;
  title: string;
  /** Hover color override (e.g. var(--danger) for the close button). Defaults to ink. */
  hoverColor?: string;
  children: ReactNode;
}

/**
 * Title-bar icon button. Consolidates the 5 nearly-identical button instances
 * that used to live inline in App.tsx. Adapts touch-target size for mobile.
 */
function NavButton({ onClick, ariaLabel, title, hoverColor = "var(--ink)", children }: NavButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${isMobile() ? "w-9 h-9" : "w-5 h-5"} cursor-pointer rounded flex items-center justify-center transition-colors focus:outline-none`}
      style={{ color: "var(--ink-3)" }}
      onMouseEnter={(e) => (e.currentTarget.style.color = hoverColor)}
      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-3)")}
      aria-label={ariaLabel}
      title={title}
    >
      {children}
    </button>
  );
}

interface TitleBarProps {
  isPillMode: boolean;
  togglePillMode: () => void;
  onCloseWidget: () => void;
}

/**
 * Top strip — Hollow wordmark + panel-nav + window controls.
 *
 * Desktop: full chrome with `WebkitAppRegion: drag` for window dragging,
 * plus pill-toggle and close buttons.
 *
 * Mobile: nav-only strip (no drag, no minimize, no close — phones don't manage
 * windows). Pads with safe-area-inset-top so iOS notches don't clip.
 *
 * Hidden entirely when pill mode is active so the floating pill is the only
 * visible UI.
 */
export function TitleBar({ isPillMode, togglePillMode, onCloseWidget }: TitleBarProps) {
  const setActivePanel = useStore((s) => s.setActivePanel);

  return (
    <div
      className="absolute top-0 left-0 right-0 flex items-center justify-between px-3.5 z-dragregion"
      style={{
        WebkitAppRegion: isMobile() ? "no-drag" : "drag",
        display: isPillMode ? "none" : "flex",
        height: isMobile() ? "calc(40px + env(safe-area-inset-top, 0px))" : "32px",
        paddingTop: isMobile() ? "env(safe-area-inset-top, 0px)" : 0,
      } as React.CSSProperties}
    >
      <div className="flex items-baseline gap-1.5">
        <span
          className="label-cap text-[11px]"
          style={{ color: "var(--ink)", letterSpacing: "0.32em", fontWeight: 600 }}
        >
          HOLLOW
        </span>
        <span className="font-mono text-[8px] tabular-nums" style={{ color: "var(--ink-3)" }}>
          ◊
        </span>
      </div>
      <div
        className="flex items-center gap-1.5"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        <NavButton onClick={() => setActivePanel("stats")} ariaLabel="Open stats" title="Stats">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M2 10V6M6 10V2M10 10V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </NavButton>
        <NavButton onClick={() => setActivePanel("achievements")} ariaLabel="Open achievements" title="Achievements">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M3 2h6v3a3 3 0 0 1-6 0V2z M5 8v2 M4 10h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </NavButton>
        <NavButton onClick={() => setActivePanel("settings")} ariaLabel="Open settings" title="Settings">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="1.6" stroke="currentColor" strokeWidth="1.3" />
            <path
              d="M6 1.5v1.5M6 9v1.5M1.5 6h1.5M9 6h1.5M2.8 2.8l1 1M8.2 8.2l1 1M2.8 9.2l1-1M8.2 3.8l1-1"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </NavButton>
        {!isMobile() && (
          <>
            <div style={{ width: "6px" }} />
            <NavButton onClick={togglePillMode} ariaLabel="Toggle pill mode" title="Pill mode">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <rect x="1" y="4" width="8" height="2" rx="1" fill="currentColor" />
              </svg>
            </NavButton>
            <NavButton
              onClick={onCloseWidget}
              ariaLabel="Hide widget"
              title="Hide"
              hoverColor="var(--danger)"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </NavButton>
          </>
        )}
      </div>
    </div>
  );
}
