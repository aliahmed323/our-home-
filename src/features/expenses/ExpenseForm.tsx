import { useState, type FormEvent } from 'react';
import { Trash2 } from 'lucide-react';
import { useData } from '@/state/DataProvider';
import { useUI } from '@/state/UIProvider';
import type { Expense } from '@/data/types';
import { EXPENSE_CATEGORIES } from '@/lib/catalog';
import { todayISO } from '@/lib/dates';
import { Avatar, Field } from '@/components/ui';

export function ExpenseForm({ expense, onDone }: { expense?: Expense; onDone: () => void }) {
  const { me, partner, currency, actions } = useData();
  const ui = useUI();
  
  const [amount, setAmount] = useState(expense ? String(expense.amount) : '');
  const [title, setTitle] = useState(expense?.title ?? '');
  const [category, setCategory] = useState(expense?.category ?? 'groceries');
  const [date, setDate] = useState(expense?.date ?? todayISO());
  const [paidBy, setPaidBy] = useState(expense?.paidBy ?? me.id);

  const numAmount = parseFloat(amount);
  const isValid = !isNaN(numAmount) && numAmount > 0 && title.trim().length > 0;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    const data = { amount: numAmount, title: title.trim(), category, date, paidBy };
    const p = expense
      ? actions.updateExpense(expense.id, data)
      : actions.addExpense(data);
    p.catch(() => ui.toast({ emoji: '⚠️', text: 'تعذر الحفظ' }));
    if (!expense) ui.toast({ emoji: '💰', text: 'تم تسجيل المصروف' });
    onDone();
  };

  const remove = () => {
    if (!expense) return;
    actions.removeExpense(expense.id);
    ui.toast({ emoji: '🗑️', text: 'تم الحذف' });
    onDone();
  };

  return (
    <form className="form" onSubmit={submit}>
      <div className="amount-input">
        <input 
          className="input" type="number" step="0.01" inputMode="decimal" placeholder="0.00" 
          value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus={!expense} 
        />
        <span className="cur">{currency}</span>
      </div>

      <Field label="في ماذا صرفت؟">
        <input className="input" placeholder="مثال: سوبرماركت، فاتورة كهرباء..." value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>

      <Field label="التصنيف">
        <div className="chips-scroll">
          {EXPENSE_CATEGORIES.map((c) => (
            <button type="button" key={c.key} className={`chip${category === c.key ? ' on' : ''}`} onClick={() => setCategory(c.key)}>
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
      </Field>

      <div className="row-2">
        <Field label="التاريخ">
          <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </Field>
        {partner && (
          <Field label="من دفع؟">
            <div className="seg" style={{ padding: 3, height: 52, background: 'var(--card-2)' }}>
              {[me, partner].map((m) => (
                <button type="button" key={m.id} className={paidBy === m.id ? 'on' : ''} onClick={() => setPaidBy(m.id)} style={{ height: '100%', fontSize: 13, gap: 4 }}>
                  <Avatar m={m} size="xs" /> {m.id === me.id ? 'أنا' : m.name}
                </button>
              ))}
            </div>
          </Field>
        )}
      </div>

      <div className="form-actions" style={{ marginTop: 12 }}>
        {expense && <button type="button" className="btn btn-soft-danger" style={{ flex: 'none', width: 52, padding: 0 }} onClick={remove} aria-label="حذف"><Trash2 size={20} /></button>}
        <button className="btn btn-primary" disabled={!isValid}>{expense ? 'حفظ' : 'تسجيل المصروف'}</button>
      </div>
    </form>
  );
}
