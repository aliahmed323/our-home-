import { useRef } from 'react';
import { CalendarDays } from 'lucide-react';
import { addDays, dueLabel, todayISO } from '@/lib/dates';

/** One-tap date shortcuts + native date picker for anything else. */
export function DuePicker({ value, onChange, allowNone = true }: {
  value: string | null; onChange: (v: string | null) => void; allowNone?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const opts = [
    { label: 'اليوم', v: todayISO() },
    { label: 'غدًا', v: todayISO(addDays(new Date(), 1)) },
    { label: 'بعد يومين', v: todayISO(addDays(new Date(), 2)) },
    { label: 'بعد أسبوع', v: todayISO(addDays(new Date(), 7)) },
  ];
  const isCustom = !!value && !opts.some((o) => o.v === value);

  const openPicker = () => {
    const el = ref.current;
    if (!el) return;
    try { el.showPicker(); } catch { el.focus(); el.click(); }
  };

  return (
    <div className="chips-scroll" style={{ marginInline: 0, paddingInline: 0, flexWrap: 'wrap' }}>
      {allowNone && (
        <button type="button" className={`chip${!value ? ' on' : ''}`} onClick={() => onChange(null)}>بلا موعد</button>
      )}
      {opts.map((o) => (
        <button type="button" key={o.label} className={`chip${value === o.v ? ' on' : ''}`} onClick={() => onChange(o.v)}>{o.label}</button>
      ))}
      <button type="button" className={`chip${isCustom ? ' on' : ''}`} onClick={openPicker} style={{ position: 'relative' }}>
        <CalendarDays size={15} /> {isCustom ? dueLabel(value!).text : 'تاريخ آخر'}
        <input
          ref={ref} type="date" value={value ?? ''} onChange={(e) => onChange(e.target.value || null)}
          style={{ position: 'absolute', inset: 0, opacity: 0, pointerEvents: 'none' }} tabIndex={-1}
        />
      </button>
    </div>
  );
}
