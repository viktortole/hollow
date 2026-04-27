import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Optional label so the user knows which surface failed (e.g. "Settings"). */
  label?: string;
  /** Called when the user clicks Reset. Use to navigate away from the broken panel. */
  onReset?: () => void;
}

interface State {
  error: Error | null;
}

/**
 * Catches render errors in any child subtree and shows a recovery surface
 * instead of blanking the entire widget. Without this, a single throwing
 * component (e.g. a stale stats reducer) leaves the user staring at an
 * empty cream rectangle with no way out.
 *
 * Class component is required — React hooks cannot trap render errors.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error(`[Hollow] ErrorBoundary (${this.props.label ?? "root"}) caught:`, error, info);
  }

  reset = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center gap-3"
        style={{
          paddingInline: "var(--widget-pad-x)",
          paddingBlock: "var(--widget-pad-y)",
          color: "var(--ink)",
        }}
        role="alert"
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "var(--ember-soft)", color: "var(--ember)" }}
          aria-hidden
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 8v5M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
        <div className="text-center max-w-[260px] flex flex-col gap-1">
          <h2 className="label-cap text-[10px]" style={{ color: "var(--ink-2)" }}>
            {this.props.label ? `${this.props.label} crashed` : "Something went wrong"}
          </h2>
          <p className="text-[11px] leading-snug" style={{ color: "var(--ink-3)" }}>
            Your fasting data is safe on disk. Try resetting this view; if it keeps happening, restart the app.
          </p>
          {this.state.error.message && (
            <p
              className="font-mono text-[9px] mt-2 break-all opacity-70"
              style={{ color: "var(--ink-3)" }}
            >
              {this.state.error.message}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={this.reset}
          className="mt-1 px-4 py-2 cursor-pointer text-[11px] font-bold tracking-widest uppercase transition-all hover:scale-105 active:scale-95"
          style={{
            background: "var(--ember)",
            color: "var(--bg-0)",
            letterSpacing: "0.16em",
            borderRadius: "var(--chip-radius)",
            minHeight: "36px",
          }}
        >
          Reset View
        </button>
      </div>
    );
  }
}
