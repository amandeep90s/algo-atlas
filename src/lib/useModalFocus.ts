import { useEffect, useEffectEvent, useRef } from "react";

export function useModalFocus(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const close = useEffectEvent(onClose);

  useEffect(() => {
    if (!open) return;
    const dialog = ref.current;
    if (!dialog) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const focusable = () =>
      Array.from(dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex="0"]',
      )).filter((element) => element.tabIndex >= 0 && element.getClientRects().length > 0);
    focusable()[0]?.focus();
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      } else if (event.key === "Tab") {
        const elements = focusable();
        if (!elements.length) return;
        event.preventDefault();
        const active = document.activeElement;
        const index = active instanceof HTMLElement ? elements.indexOf(active) : -1;
        const next = index < 0 ? (event.shiftKey ? elements.length - 1 : 0)
          : (index + (event.shiftKey ? -1 : 1) + elements.length) % elements.length;
        elements[next].focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, [open]);

  return ref;
}
