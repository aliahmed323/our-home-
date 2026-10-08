export interface ToastItem {
  id: number;
  text: string;
  emoji?: string;
  urgent?: boolean;
  action?: { label: string; run: () => void };
}

export function Toasts({ items, onDismiss }: { items: ToastItem[]; onDismiss: (id: number) => void }) {
  return (
    <div className="toasts" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className={`toast${t.urgent ? ' urgent' : ''}`} onClick={() => onDismiss(t.id)}>
          {t.emoji && <span className="e">{t.emoji}</span>}
          <span className="t">{t.text}</span>
          {t.action && (
            <button onClick={(e) => { e.stopPropagation(); t.action!.run(); onDismiss(t.id); }}>{t.action.label}</button>
          )}
        </div>
      ))}
    </div>
  );
}
