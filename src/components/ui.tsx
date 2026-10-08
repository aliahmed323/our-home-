import type { CSSProperties, ReactNode } from 'react';
import { Check as CheckIcon } from 'lucide-react';
import type { Member } from '@/data/types';

export function Avatar({ m, size, online }: { m?: Pick<Member, 'emoji' | 'color'> | null; size?: 'xs' | 'sm' | 'lg' | 'xl'; online?: boolean }) {
  return (
    <span className={`avatar${size ? ` ${size}` : ''}`} style={{ '--c': m?.color ?? '#999' } as CSSProperties}>
      {m?.emoji ?? '❔'}
      {online && <i className="dot" />}
    </span>
  );
}

export function Card({ id, icon, tint, title, sub, actions, children, className = '' }: {
  id?: string; icon: ReactNode; tint: string; title: ReactNode; sub?: ReactNode;
  actions?: ReactNode; children: ReactNode; className?: string;
}) {
  return (
    <section id={id} className={`card ${className}`} style={{ '--tint': tint } as CSSProperties}>
      <header className="card-head">
        <span className="card-icon">{icon}</span>
        <div className="card-title">
          <h2>{title}</h2>
          {sub && <p>{sub}</p>}
        </div>
        {actions && <div className="card-actions">{actions}</div>}
      </header>
      {children}
    </section>
  );
}

export function CheckCircle({ on, half, onClick, color, square, label }: {
  on: boolean; half?: boolean; onClick: () => void; color?: string; square?: boolean; label?: string;
}) {
  return (
    <button
      className={`check${on ? ' on' : ''}${half && !on ? ' half' : ''}${square ? ' square' : ''}`}
      style={color ? ({ '--c': color } as CSSProperties) : undefined}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      aria-pressed={on}
      aria-label={label ?? 'تم'}
    >
      <CheckIcon size={16} strokeWidth={3} />
    </button>
  );
}

export function Seg<T extends string>({ value, options, onChange }: {
  value: T; options: { key: T; label: ReactNode }[]; onChange: (v: T) => void;
}) {
  return (
    <div className="seg" role="tablist">
      {options.map((o) => (
        <button key={o.key} role="tab" className={o.key === value ? 'on' : ''} onClick={() => onChange(o.key)} type="button">
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Empty({ emoji, text }: { emoji: string; text: ReactNode }) {
  return <div className="empty"><span className="e">{emoji}</span>{text}</div>;
}

export function Ring({ pct, size = 58, stroke = 6, children }: { pct: number; size?: number; stroke?: number; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const id = `g${size}`;
  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FF8A65" />
            <stop offset="0.5" stopColor="#F0567A" />
            <stop offset="1" stopColor="#7C5CFF" />
          </linearGradient>
        </defs>
        <circle className="ring-track" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} />
        <circle
          className="ring-val" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke}
          stroke={`url(#${id})`} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, Math.max(0, pct)))}
        />
      </svg>
      <span className="e">{children}</span>
    </div>
  );
}

export function EmojiPick({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="emoji-pick">
      {options.map((e) => (
        <button type="button" key={e} className={e === value ? 'on' : ''} onClick={() => onChange(e)}>{e}</button>
      ))}
    </div>
  );
}

export function ColorPick({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="color-pick">
      {options.map((c) => (
        <button type="button" key={c} className={c === value ? 'on' : ''} style={{ background: c, color: c }} onClick={() => onChange(c)} aria-label={c} />
      ))}
    </div>
  );
}

export function Field({ label, children }: { label: ReactNode; children: ReactNode }) {
  return <div className="field"><label>{label}</label>{children}</div>;
}

export function Switch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return <button type="button" className={`switch${on ? ' on' : ''}`} onClick={() => onChange(!on)} aria-pressed={on} />;
}
