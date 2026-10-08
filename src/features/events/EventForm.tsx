import { useState, type FormEvent } from 'react';
import { Trash2 } from 'lucide-react';
import { useData } from '@/state/DataProvider';
import { useUI } from '@/state/UIProvider';
import type { CalEvent } from '@/data/types';
import { EVENT_EMOJIS } from '@/lib/catalog';
import { addDays, todayISO } from '@/lib/dates';
import { EmojiPick, Field } from '@/components/ui';

export function EventForm({ event, onDone }: { event?: CalEvent; onDone: () => void }) {
  const { actions } = useData();
  const ui = useUI();
  
  const [title, setTitle] = useState(event?.title ?? '');
  const [date, setDate] = useState(event?.date ?? todayISO(addDays(new Date(), 1)));
  const [time, setTime] = useState(event?.time ?? '');
  const [emoji, setEmoji] = useState(event?.emoji ?? '📅');
  const [notes, setNotes] = useState(event?.notes ?? '');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const data = { title: title.trim(), date, time: time || undefined, emoji, notes: notes.trim() };
    const p = event
      ? actions.updateEvent(event.id, data)
      : actions.addEvent(data);
    p.catch(() => ui.toast({ emoji: '⚠️', text: 'تعذر الحفظ' }));
    if (!event) ui.toast({ emoji: '📅', text: 'تمت إضافة الموعد' });
    onDone();
  };

  const remove = () => {
    if (!event) return;
    actions.removeEvent(event.id);
    ui.toast({ emoji: '🗑️', text: 'تم الحذف' });
    onDone();
  };

  return (
    <form className="form" onSubmit={submit}>
      <input className="input big" placeholder="عنوان الموعد أو الحدث" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus={!event} />

      <div className="row-2">
        <Field label="التاريخ">
          <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </Field>
        <Field label="الوقت (اختياري)">
          <input className="input" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </Field>
      </div>

      <Field label="أيقونة">
        <EmojiPick value={emoji} onChange={setEmoji} options={EVENT_EMOJIS} />
      </Field>

      <Field label="ملاحظات (اختياري)">
        <textarea className="textarea" placeholder="تفاصيل الموعد..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </Field>

      <div className="form-actions" style={{ marginTop: 12 }}>
        {event && <button type="button" className="btn btn-soft-danger" style={{ flex: 'none', width: 52, padding: 0 }} onClick={remove} aria-label="حذف"><Trash2 size={20} /></button>}
        <button className="btn btn-primary" disabled={!title.trim()}>{event ? 'حفظ' : 'إضافة موعد'}</button>
      </div>
    </form>
  );
}
