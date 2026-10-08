import { Banknote, TrendingUp } from 'lucide-react';
import { useData } from '@/state/DataProvider';
import { useUI } from '@/state/UIProvider';
import { Card, Empty } from '@/components/ui';
import { ExpenseForm } from './ExpenseForm';
import { monthKey, money } from '@/lib/dates';
import { EXPENSE_CATEGORIES, catOf } from '@/lib/catalog';
import type { Expense } from '@/data/types';

export function ExpensesCard() {
  const { me, partner, expenses, currency } = useData();
  const ui = useUI();
  
  const currentMonth = monthKey(new Date().toISOString());
  const thisMonth = expenses.filter((e) => monthKey(e.date) === currentMonth);
  
  const total = thisMonth.reduce((sum, e) => sum + e.amount, 0);
  const byCategory = EXPENSE_CATEGORIES.map((c) => ({
    ...c, total: thisMonth.filter((e) => e.category === c.key).reduce((sum, e) => sum + e.amount, 0),
  })).filter((c) => c.total > 0).sort((a, b) => b.total - a.total);
  
  const myTotal = thisMonth.filter((e) => e.paidBy === me.id).reduce((sum, e) => sum + e.amount, 0);
  const partnerTotal = total - myTotal;

  const openExpense = (e: Expense) => ui.open((c) => <ExpenseForm expense={e} onDone={c} />, { title: 'تعديل المصروف' });

  return (
    <Card 
      icon={<Banknote />} tint="var(--green-soft)" title="مصروفات الشهر" 
      actions={<button className="link-btn" onClick={() => ui.open((c) => <ExpenseForm onDone={c} />)}>إضافة</button>}
    >
      <div className="money-hero">
        <div className="big num">{money(total, currency)}</div>
        {total > 0 && <div className="delta up"><TrendingUp size={14} /></div>}
      </div>

      {total > 0 ? (
        <>
          <div className="stack-bar">
            {byCategory.map((c) => (
              <i key={c.key} style={{ width: `${(c.total / total) * 100}%`, background: c.color }} title={`${c.label}: ${c.total}`} />
            ))}
          </div>
          
          <div className="legend">
            {byCategory.slice(0, 4).map((c) => (
              <span key={c.key}><i style={{ background: c.color }} /> {c.label} <b className="num">{c.total}</b></span>
            ))}
          </div>

          {partner && (
            <div className="split">
              <span>{me.name} <b className="num">{Math.round((myTotal / total) * 100)}%</b></span>
              <div className="bar">
                <i style={{ width: `${(myTotal / total) * 100}%`, background: 'var(--brand-2)' }} />
                <i style={{ width: `${(partnerTotal / total) * 100}%`, background: 'var(--brand)' }} />
              </div>
              <span>{partner.name} <b className="num">{Math.round((partnerTotal / total) * 100)}%</b></span>
            </div>
          )}

          <div className="list" style={{ marginTop: 12 }}>
            {thisMonth.slice(0, 3).map((e) => {
              const c = catOf(EXPENSE_CATEGORIES, e.category);
              return (
                <div key={e.id} className="row tap" onClick={() => openExpense(e)} style={{ minHeight: 48 }}>
                  <div style={{ fontSize: 20, width: 32, textAlign: 'center' }}>{c.emoji}</div>
                  <div className="row-main">
                    <div className="row-title" style={{ fontSize: 14 }}>{e.title}</div>
                    <div className="row-meta" style={{ fontSize: 11 }}>
                      {e.paidBy === me.id ? 'أنا' : partner?.name || 'شريكك'} • {e.date.slice(8, 10)} من الشهر
                    </div>
                  </div>
                  <div className="exp-amt num" style={{ color: c.color }}>{money(e.amount, currency)}</div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <Empty emoji="💸" text="لم يتم تسجيل أي مصروفات هذا الشهر" />
      )}
    </Card>
  );
}
