import { useState, type FormEvent } from 'react';
import { TriangleAlert, Send } from 'lucide-react';
import { useData } from '@/state/DataProvider';
import { useUI } from '@/state/UIProvider';
import { EMERGENCY_PRESETS } from '@/lib/catalog';

export function EmergencyForm({ onDone }: { onDone: () => void }) {
  const { partner, actions } = useData();
  const ui = useUI();
  const [text, setText] = useState('');

  const submit = (message: string) => {
    if (!message.trim() || !partner) return;
    actions.sendAlert(message.trim());
    ui.toast({ emoji: '🚨', text: 'تم إرسال التنبيه العاجل' });
    onDone();
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit(text);
  };

  if (!partner) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <TriangleAlert size={48} color="var(--amber)" style={{ margin: '0 auto 10px' }} />
        <h3 style={{ margin: '0 0 10px' }}>لا يوجد شريك بعد</h3>
        <p className="muted" style={{ fontSize: 14 }}>هذه الميزة ترسل تنبيهاً فورياً لشريكك، قم بدعوته أولاً للبيت.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ textAlign: 'center', padding: '10px 0 0' }}>
        <TriangleAlert size={40} color="var(--red)" style={{ margin: '0 auto 10px' }} />
        <h3 style={{ margin: '0 0 4px', fontSize: 20 }}>تنبيه عاجل</h3>
        <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>سيصل تنبيه قوي بالصوت والاهتزاز لهاتف شريكك فوراً.</p>
      </div>

      <div className="sos-presets">
        {EMERGENCY_PRESETS.map((p) => (
          <button key={p} type="button" onClick={() => submit(p)}>{p}</button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-3)', fontSize: 12 }}>
        <hr style={{ flex: 1, borderColor: 'var(--line-2)' }} /> أو رسالة مخصصة <hr style={{ flex: 1, borderColor: 'var(--line-2)' }} />
      </div>

      <form onSubmit={onSubmit} style={{ display: 'flex', gap: 10 }}>
        <input 
          className="input" style={{ flex: 1, borderColor: 'var(--red-soft)' }} 
          placeholder="اكتب رسالتك العاجلة..." value={text} onChange={(e) => setText(e.target.value)} 
        />
        <button type="submit" className="btn btn-danger" disabled={!text.trim()} style={{ width: 52, padding: 0 }}>
          <Send size={20} className="ltr" />
        </button>
      </form>
    </div>
  );
}
