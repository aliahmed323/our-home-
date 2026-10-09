import { useState, type FormEvent } from 'react';
import { Trash2 } from 'lucide-react';
import { useData } from '@/state/DataProvider';
import { useUI } from '@/state/UIProvider';
import type { Note } from '@/data/types';
import { NOTE_COLORS } from '@/lib/catalog';
import { ColorPick, Field, Switch } from '@/components/ui';

export function NoteForm({ note, onDone }: { note?: Note; onDone: () => void }) {
  const { actions } = useData();
  const ui = useUI();
  
  const [text, setText] = useState(note?.text ?? '');
  const [color, setColor] = useState(note?.color ?? NOTE_COLORS[0]);
  const [pinned, setPinned] = useState(note?.pinned ?? false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const data = { text: text.trim(), color, pinned };
    const p = note
      ? actions.updateNote(note.id, data)
      : actions.addNote(data);
    p.catch(() => ui.toast({ emoji: '⚠️', text: 'تعذر الحفظ' }));
    onDone();
  };

  const remove = () => {
    if (!note) return;
    actions.removeNote(note.id);
    ui.toast({ emoji: '🗑️', text: 'تم الحذف' });
    onDone();
  };

  return (
    <form className="form" onSubmit={submit}>
      <textarea 
        className="textarea big" placeholder="اكتب الملاحظة هنا..." value={text} 
        onChange={(e) => setText(e.target.value)} autoFocus={!note}
        style={{ background: color, minHeight: 140, color: '#2A2520' }}
      />
      
      <div style={{ display: 'flex', gap: 8, marginTop: -8 }}>
        <button type="button" className="pill" onClick={() => setText((s) => s + (s && !s.endsWith('\n') ? '\n' : '') + '• ')}>• نقطة</button>
        <button type="button" className="pill" onClick={() => setText((s) => s + (s && !s.endsWith('\n') ? '\n' : '') + '☐ ')}>☐ مهمة</button>
      </div>

      <Field label="لون الملاحظة">
        <ColorPick value={color} onChange={setColor} options={NOTE_COLORS} />
      </Field>

      <div className="toggle-row">
        <div>
          <b style={{ fontSize: 14.5 }}>تثبيت الملاحظة</b>
          <div className="muted" style={{ fontSize: 12 }}>لتبقى في الأعلى دائمًا</div>
        </div>
        <Switch on={pinned} onChange={setPinned} />
      </div>

      <div className="form-actions" style={{ marginTop: 12 }}>
        {note && <button type="button" className="btn btn-soft-danger" style={{ flex: 'none', width: 52, padding: 0 }} onClick={remove} aria-label="حذف"><Trash2 size={20} /></button>}
        <button className="btn btn-primary" disabled={!text.trim()}>{note ? 'حفظ' : 'إضافة الملاحظة'}</button>
      </div>
    </form>
  );
}
