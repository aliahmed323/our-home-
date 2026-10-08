import { useState } from 'react';
import { Target, Plus } from 'lucide-react';
import { useData } from '@/state/DataProvider';
import { useUI } from '@/state/UIProvider';
import { Ring } from '@/components/ui';
import { GoalForm } from './GoalForm';
import { money, num } from '@/lib/dates';
import type { Goal } from '@/data/types';

function ContributeForm({ goal, onDone }: { goal: Goal; onDone: () => void }) {
  const { actions } = useData();
  const [amount, setAmount] = useState('');
  
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = parseFloat(amount);
    if (!isNaN(v) && v !== 0) {
      actions.contributeGoal(goal, v);
      onDone();
    }
  };

  return (
    <form className="form" onSubmit={submit}>
      <p style={{ margin: '0 0 10px', fontSize: 14 }} className="muted">
        الهدف: {money(goal.target, goal.unit)} • المتبقي: <b className="num" style={{ color: 'var(--text)' }}>{money(goal.target - goal.current, goal.unit)}</b>
      </p>
      <div className="amount-input">
        <input 
          className="input" type="number" step="any" inputMode="decimal" placeholder="0" 
          value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus 
        />
        <span className="cur">{goal.unit}</span>
      </div>
      <div className="form-actions">
        <button className="btn btn-primary" disabled={!amount}>تحديث الإنجاز</button>
      </div>
    </form>
  );
}

export function GoalsSection() {
  const { goals } = useData();
  const ui = useUI();
  
  const openGoal = (g: Goal) => ui.open((c) => <GoalForm goal={g} onDone={c} />, { title: 'تعديل الهدف', actions: <button className="link-btn" onClick={() => ui.replace((c2) => <ContributeForm goal={g} onDone={c2} />, { title: 'تحديث الإنجاز' })}>تحديث الإنجاز</button> });

  if (goals.length === 0) return null;

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ padding: '0 18px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontWeight: 700, fontSize: 17 }}>
        <Target size={20} color="var(--pink)" /> أهدافنا
      </div>
      <div className="goals">
        {goals.map((g) => {
          const pct = Math.min(100, Math.round((g.current / g.target) * 100));
          return (
            <div key={g.id} className="goal tap" onClick={() => openGoal(g)}>
              <div className="g-top">
                <Ring pct={pct / 100}>{g.emoji}</Ring>
                <div style={{ textAlign: 'left' }}>
                  <div className="pct">{pct}%</div>
                  <div className="g-sub">إنجاز</div>
                </div>
              </div>
              <div>
                <div className="g-title">{g.title}</div>
                <div className="g-sub">{num(g.current)} من {num(g.target)} {g.unit}</div>
              </div>
              <div className="progress"><i style={{ width: `${pct}%` }} /></div>
            </div>
          );
        })}
        <button className="goal add" onClick={() => ui.open((c) => <GoalForm onDone={c} />, { title: 'إضافة هدف' })}>
          <Plus size={32} />
          <div style={{ marginTop: 8, fontWeight: 600 }}>هدف جديد</div>
        </button>
      </div>
    </div>
  );
}
