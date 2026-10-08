import { useState } from 'react';
import { CheckSquare, Plus } from 'lucide-react';
import { useData } from '@/state/DataProvider';
import { useUI } from '@/state/UIProvider';
import { Card, CheckCircle, Empty, Seg } from '@/components/ui';
import { TaskForm } from './TaskForm';
import { dueLabel } from '@/lib/dates';
import type { Task } from '@/data/types';
import { catOf, PRIORITIES } from '@/lib/catalog';

export function TasksCard() {
  const { me, tasks, actions } = useData();
  const ui = useUI();
  const [tab, setTab] = useState<'my' | 'our'>('my');
  const [quickTitle, setQuickTitle] = useState('');

  const myTasks = tasks.filter((t) => t.status !== 'done' && t.assignee === me.id);
  const ourTasks = tasks.filter((t) => t.status !== 'done' && t.scope === 'shared');
  
  const active = tab === 'my' ? myTasks : ourTasks;

  const addQuick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    actions.addTask({ 
      title: quickTitle.trim(), scope: tab === 'our' ? 'shared' : 'personal', 
      assignee: tab === 'our' ? 'both' : me.id, priority: 'normal', status: 'todo' 
    });
    setQuickTitle('');
  };

  const openTask = (t: Task) => ui.open((c) => <TaskForm task={t} onDone={c} />, { title: 'تعديل المهمة' });

  return (
    <Card icon={<CheckSquare />} tint="var(--violet-soft)" title="المهام" sub={`${myTasks.length} لي • ${ourTasks.length} مشتركة`}>
      <div style={{ marginBottom: 12 }}>
        <Seg value={tab} onChange={setTab} options={[{ key: 'my', label: '✅ مهامي' }, { key: 'our', label: '👩‍❤️‍👨 مهامنا' }]} />
      </div>

      <div className="list">
        {active.map((t) => (
          <div key={t.id} className="row tap" onClick={() => openTask(t)}>
            <CheckCircle 
              on={false} half={t.status === 'doing'} 
              onClick={() => actions.setTaskStatus(t, 'done')} 
              color="var(--violet)" 
            />
            <div className="row-main">
              <div className="row-title">{t.title}</div>
              <div className="row-meta">
                {t.priority !== 'normal' && (
                  <span className="pill" style={{ color: catOf(PRIORITIES, t.priority).color }}>
                    {catOf(PRIORITIES, t.priority).label}
                  </span>
                )}
                {t.status === 'doing' && <span className="pill doing">جارية</span>}
                {t.due && (
                  <span className={`pill ${dueLabel(t.due).tone}`}>
                    {dueLabel(t.due).text}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {active.length === 0 && <Empty emoji="🎉" text="كل المهام منجزة!" />}
      </div>

      <form className="inline-add" onSubmit={addQuick}>
        <Plus size={20} className="muted" style={{ marginLeft: 8 }} />
        <input placeholder={tab === 'my' ? 'مهمة جديدة لي...' : 'مهمة مشتركة...'} value={quickTitle} onChange={(e) => setQuickTitle(e.target.value)} enterKeyHint="send" />
        <button type="submit" className="go" disabled={!quickTitle.trim()}><CheckSquare size={16} /></button>
      </form>
    </Card>
  );
}
