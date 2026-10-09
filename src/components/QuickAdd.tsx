import { 
  CheckSquare, ShoppingCart, Banknote, CalendarDays, 
  Target, StickyNote, TriangleAlert, LayoutDashboard
} from 'lucide-react';
import { useUI } from '@/state/UIProvider';
import { TaskForm } from '@/features/tasks/TaskForm';
import { NeedForm } from '@/features/needs/NeedForm';
import { ExpenseForm } from '@/features/expenses/ExpenseForm';
import { EventForm } from '@/features/events/EventForm';
import { GoalForm } from '@/features/goals/GoalForm';
import { NoteForm } from '@/features/notes/NoteForm';
import { EmergencyForm } from '@/features/alerts/EmergencyForm';
import { PlanForm } from '@/features/plans/PlanForm';
import { Map } from 'lucide-react';

export function QuickAddMenu() {
  const ui = useUI();
  
  const T = [
    { label: 'مهمة', icon: CheckSquare, color: 'var(--violet-soft)', fg: 'var(--violet)', fn: () => ui.replace((c) => <TaskForm onDone={c} />, { title: 'إضافة مهمة' }) },
    { label: 'احتياج', icon: ShoppingCart, color: 'var(--blue-soft)', fg: 'var(--blue)', fn: () => ui.replace((c) => <NeedForm onDone={c} />, { title: 'إضافة احتياج' }) },
    { label: 'مصروف', icon: Banknote, color: 'var(--green-soft)', fg: 'var(--green)', fn: () => ui.replace((c) => <ExpenseForm onDone={c} />, { title: 'تسجيل مصروف' }) },
    { label: 'موعد', icon: CalendarDays, color: 'var(--amber-soft)', fg: 'var(--amber)', fn: () => ui.replace((c) => <EventForm onDone={c} />, { title: 'إضافة موعد' }) },
    { label: 'خطة', icon: Map, color: 'var(--teal-soft)', fg: 'var(--teal)', fn: () => ui.replace((c) => <PlanForm onDone={c} />, { title: 'إضافة خطة مستقبلية' }) },
    { label: 'هدف', icon: Target, color: 'var(--pink-soft)', fg: 'var(--pink)', fn: () => ui.replace((c) => <GoalForm onDone={c} />, { title: 'إضافة هدف' }) },
    { label: 'ملاحظة', icon: StickyNote, color: 'var(--pink-soft)', fg: 'var(--pink)', fn: () => ui.replace((c) => <NoteForm onDone={c} />, { title: 'إضافة ملاحظة' }) },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="qa-grid">
        {T.map((t) => (
          <button 
            key={t.label} className="qa-tile" 
            style={{ '--tint': t.color, color: t.fg } as any}
            onClick={t.fn}
          >
            <t.icon size={26} />
            {t.label}
          </button>
        ))}
      </div>
      
      <button 
        className="qa-tile danger" 
        style={{ aspectRatio: 'auto', height: 70, flexDirection: 'row', fontSize: 16 }}
        onClick={() => ui.replace((c) => <EmergencyForm onDone={c} />)}
      >
        <TriangleAlert size={24} /> طلب عاجل!
      </button>
    </div>
  );
}

export function FabMenu() {
  const ui = useUI();
  return (
    <>
      <div className="bottom-fade" />
      <button className="fab" onClick={() => ui.open(() => <QuickAddMenu />, { title: 'إضافة سريعة' })}>
        <LayoutDashboard size={22} fill="currentColor" /> إضافة
      </button>
      <button className="mini-fab" onClick={() => ui.open((c) => <NoteForm onDone={c} />, { title: 'ملاحظة سريعة' })}>
        <StickyNote size={20} />
      </button>
    </>
  );
}
