import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Sheet } from '@/components/Sheet';
import { Toasts, type ToastItem } from '@/components/Toasts';

export interface SheetOpts { title?: ReactNode; full?: boolean; actions?: ReactNode }
type Render = (close: () => void) => ReactNode;
interface SheetEntry { id: number; render: Render; opts: SheetOpts; closing?: boolean }

interface UIApi {
  /** Open a bottom sheet. Android back button / swipe-down closes it. */
  open(render: Render, opts?: SheetOpts): void;
  /** Swap the content of the top sheet (e.g. Quick Add → specific form). */
  replace(render: Render, opts?: SheetOpts): void;
  closeTop(): void;
  toast(t: Omit<ToastItem, 'id'>): void;
}

const Ctx = createContext<UIApi>(null!);
export const useUI = () => useContext(Ctx);

let seq = 0;

export function UIProvider({ children }: { children: ReactNode }) {
  const [sheets, setSheets] = useState<SheetEntry[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const sheetsRef = useRef(sheets);
  sheetsRef.current = sheets;

  const animateOut = useCallback((id: number) => {
    setSheets((s) => s.map((x) => (x.id === id ? { ...x, closing: true } : x)));
    setTimeout(() => setSheets((s) => s.filter((x) => x.id !== id)), 260);
  }, []);

  // Each open sheet owns one history entry so the hardware back button closes it.
  useEffect(() => {
    const onPop = () => {
      const open = sheetsRef.current.filter((s) => !s.closing);
      const top = open[open.length - 1];
      if (top) animateOut(top.id);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [animateOut]);

  const closeTop = useCallback(() => {
    const open = sheetsRef.current.filter((s) => !s.closing);
    if (!open.length) return;
    if ((history.state as { sheet?: number } | null)?.sheet) history.back();
    else animateOut(open[open.length - 1].id);
  }, [animateOut]);

  const api = useMemo<UIApi>(() => ({
    open(render, opts = {}) {
      const id = ++seq;
      history.pushState({ sheet: id }, '', window.location.pathname + window.location.search);
      setSheets((s) => [...s, { id, render, opts }]);
    },
    replace(render, opts = {}) {
      setSheets((s) => {
        if (!s.length) return s;
        const copy = [...s];
        copy[copy.length - 1] = { ...copy[copy.length - 1], render, opts };
        return copy;
      });
    },
    closeTop,
    toast(t) {
      const id = ++seq;
      setToasts((x) => [...x.slice(-2), { ...t, id }]);
      setTimeout(() => setToasts((x) => x.filter((y) => y.id !== id)), t.urgent ? 7000 : 3200);
    },
  }), [closeTop]);

  useEffect(() => {
    document.documentElement.style.overflow = sheets.length ? 'hidden' : '';
  }, [sheets.length]);

  return (
    <Ctx.Provider value={api}>
      {children}
      {sheets.map((s) => (
        <Sheet key={s.id} {...s.opts} closing={s.closing} onClose={closeTop}>
          {s.render(closeTop)}
        </Sheet>
      ))}
      <Toasts items={toasts} onDismiss={(id) => setToasts((x) => x.filter((y) => y.id !== id))} />
    </Ctx.Provider>
  );
}
