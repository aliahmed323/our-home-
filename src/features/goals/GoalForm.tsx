import { useState, type FormEvent } from 'react';
import { Trash2 } from 'lucide-react';
import { useData } from '@/state/DataProvider';
import { useUI } from '@/state/UIProvider';
import type { Goal } from '@/data/types';
import { GOAL_EMOJIS } from '@/lib/catalog';
import { EmojiPick, Field } from '@/components/ui';

export function GoalForm({ goal, onDone }: { goal?: Goal; onDone: () => void }) {
  const { currency, actions } = useData();
  const ui = useUI();
  
  const [title, setTitle] = useState(goal?.title ?? '');
  const [target, setTarget] = useState(goal ? String(goal.target) : '');
  const [unit, setUnit] = useState(goal?.unit ?? currency);
  const [emoji, setEmoji] = useState(goal?.emoji ?? '🎯');

  const numTarget = parseFloat(target);
  const isValid = !isNaN(numTarget) && numTarget > 0 && title.trim().length > 0;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    const data = { title: title.trim(), target: numTarget, current: goal?.current ?? 0, unit: unit.trim(), emoji };
    const p = goal
      ? actions.updateGoal(goal.id, data)
      : actions.addGoal(data);
    p.catch(() => ui.toast({ emoji: '⚠️', text: 'تعذر الحفظ' }));
    if (!goal) ui.toast({ emoji: '🎯', text: 'تمت إضافة الهدف' });
    onDone();
  };

  const remove = () => {
    if (!goal) return;
    actions.removeGoal(goal.id);
    ui.toast({ emoji: '🗑️', text: 'تم الحذف' });
    onDone();
  };

  return (
    <form className="form" onSubmit={submit}>
      <input className="input big" placeholder="ما هو هدفنا؟" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus={!goal} />

      <div className="row-2">
        <Field label="المبلغ المستهدف">
          <input className="input" type="number" step="any" inputMode="decimal" placeholder="0" value={target} onChange={(e) => setTarget(e.target.value)} />
        </Field>
        <Field label="الوحدة">
          <input className="input" placeholder={currency} value={unit} onChange={(e) => setUnit(e.target.value)} />
        </Field>
      </div>

      <Field label="أيقونة معبرة">
        <EmojiPick value={emoji} onChange={setEmoji} options={GOAL_EMOJIS} />
      </Field>

      <div className="form-actions" style={{ marginTop: 12 }}>
        {goal && <button type="button" className="btn btn-soft-danger" style={{ flex: 'none', width: 52, padding: 0 }} onClick={remove} aria-label="حذف"><Trash2 size={20} /></button>}
        <button className="btn btn-primary" disabled={!isValid}>{goal ? 'حفظ' : 'إضافة الهدف'}</button>
      </div>
    </form>
  );
}
