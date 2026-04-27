import { useEffect } from "react";

/**
 * Calls `onEscape` once whenever the user presses the Escape key while `enabled`
 * is true. Listener is attached at the document level so it fires regardless of
 * which element holds focus — a popover or context menu can dismiss without
 * having to be focused first.
 *
 * Use for popovers, context menus, dropdowns, modal-style overlays. Combine
 * with `useOutsideClick` (TODO) for a complete dismissal contract.
 *
 * @example
 * useEscapeKey(open, () => setOpen(false));
 */
export function useEscapeKey(enabled: boolean, onEscape: () => void): void {
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onEscape();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [enabled, onEscape]);
}
