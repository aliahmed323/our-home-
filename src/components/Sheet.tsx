import { useRef, type ReactNode, type PointerEvent } from 'react';
import { X } from 'lucide-react';
import { ErrorBoundary } from './ErrorBoundary';

interface Props {
  title?: ReactNode;
  actions?: ReactNode;
  full?: boolean;
  closing?: boolean;
  onClose: () => void;
  children: ReactNode;
}

/** Bottom sheet (mobile) / centered dialog (desktop) with swipe-down to dismiss. */
export function Sheet({ title, actions, full, closing, onClose, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ y: number; dy: number; t: number } | null>(null);

  const onDown = (e: PointerEvent) => {
    if (window.innerWidth >= 700) return;
    if ((e.target as HTMLElement).closest('button, input, a, select, textarea')) return;
    drag.current = { y: e.clientY, dy: 0, t: Date.now() };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    if (ref.current) ref.current.style.transition = 'none';
  };
  const onMove = (e: PointerEvent) => {
    if (!drag.current || !ref.current) return;
    const dy = Math.max(0, e.clientY - drag.current.y);
    drag.current.dy = dy;
    ref.current.style.transform = `translateY(${dy}px)`;
  };
  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    const el = ref.current;
    if (!d || !el) return;
    const velocity = d.dy / Math.max(1, Date.now() - d.t);
    if (d.dy > 120 || velocity > 0.6) {
      el.style.setProperty('--drag', `${d.dy}px`);
      onClose();
    } else {
      el.style.transition = 'transform .3s cubic-bezier(.22,1,.36,1)';
      el.style.transform = '';
    }
  };
  const dragProps = { onPointerDown: onDown, onPointerMove: onMove, onPointerUp: onUp, onPointerCancel: onUp };

  return (
    <div className={`sheet-root${closing ? ' closing' : ''}`} role="dialog" aria-modal="true">
      <div className="sheet-backdrop" onClick={onClose} />
      <div ref={ref} className={`sheet${full ? ' full' : ''}`}>
        <div className="sheet-grip" {...dragProps}><span /></div>
        {(title || actions) && (
          <div className="sheet-head" {...dragProps}>
            <h3>{title}</h3>
            {actions}
            <button className="icon-btn sm" onClick={onClose} aria-label="إغلاق"><X size={20} /></button>
          </div>
        )}
        <div className="sheet-body">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
