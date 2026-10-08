import { useState, type FormEvent } from 'react';
import { Trash2 } from 'lucide-react';
import { useData } from '@/state/DataProvider';
import { useUI } from '@/state/UIProvider';
import type { Plan } from '@/data/types';
import { Field } from '@/components/ui';

export function PlanForm({ plan, onDone }: { plan?: Plan; onDone: () => void }) {
  const { actions } = useData();
  const ui = useUI();
  
  const [title, setTitle] = useState(plan?.title ?? '');
  const [notes, setNotes] = useState(plan?.notes ?? '');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const data = { title: title.trim(), notes: notes.trim() };
    const p = plan
      ? actions.updatePlan(plan.id, data)
      : actions.addPlan({ ...data, doneAt: null });
    p.catch(() => ui.toast({ emoji: '⚠️', text: 'تعذر الحفظ' }));
    if (!plan) ui.toast({ emoji: '💭', text: 'تمت إضافة الخطة' });
    onDone();
  };

  const remove = () => {
    if (!plan) return;
    actions.removePlan(plan.id);
    ui.toast({ emoji: '🗑️', text: 'تم الحذف' });
    onDone();
  };

  return (
    <form className="form" onSubmit={submit}>
      <input className="input big" placeholder="ما هي خطتك؟" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus={!plan} enterKeyHint="next" />

      <Field label="تفاصيل (اختياري)">
        <textarea className="textarea" placeholder="أي تفاصيل أو أفكار حول الخطة..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
      </Field>

      <div className="form-actions">
        {plan && <button type="button" className="btn btn-soft-danger" style={{ flex: 'none', width: 52, padding: 0 }} onClick={remove} aria-label="حذف"><Trash2 size={20} /></button>}
        <button className="btn btn-primary" disabled={!title.trim()}>{plan ? 'حفظ' : 'إضافة الخطة'}</button>
      </div>
    </form>
  );
}
