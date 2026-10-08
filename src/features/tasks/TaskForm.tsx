import { useState, type FormEvent } from 'react';
import { Trash2 } from 'lucide-react';
import { useData } from '@/state/DataProvider';
import { useUI } from '@/state/UIProvider';
import type { Priority, Task, TaskScope, TaskStatus } from '@/data/types';
import { PRIORITIES, TASK_STATUSES } from '@/lib/catalog';
import { Avatar, Field, Seg } from '@/components/ui';
import { DuePicker } from '@/components/DuePicker';

export function TaskForm({ task, defaults, onDone }: {
  task?: Task;
  defaults?: Partial<Task>;
  onDone: () => void;
}) {
  const { me, partner, actions } = useData();
  const ui = useUI();
  const init = { ...defaults, ...task };
  const [title, setTitle] = useState(init.title ?? '');
  const [scope, setScope] = useState<TaskScope>(init.scope ?? 'personal');
  const [assignee, setAssignee] = useState<string>(init.assignee && init.assignee !== 'both' ? init.assignee : me.id);
  const [priority, setPriority] = useState<Priority>(init.priority ?? 'normal');
  const [status, setStatus] = useState<TaskStatus>(init.status ?? 'todo');
  const [due, setDue] = useState<string | null>(init.due ?? null);
  const [notes, setNotes] = useState(init.notes ?? '');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const data = {
      title: title.trim(), scope, assignee: scope === 'shared' ? 'both' : assignee,
      priority, status, due, notes: notes.trim(),
    } as const;
    const p = task
      ? (status !== task.status ? actions.setTaskStatus(task, status) : Promise.resolve()).then(() => actions.updateTask(task.id, data))
      : actions.addTask({ ...data, doneAt: null, doneBy: null });
    p.catch(() => ui.toast({ emoji: '⚠️', text: 'تعذر الحفظ' }));
    if (!task) ui.toast({ emoji: '✅', text: 'تمت إضافة المهمة' });
    onDone();
  };

  const remove = () => {
    if (!task) return;
    actions.removeTask(task.id);
    ui.toast({ emoji: '🗑️', text: 'تم حذف المهمة' });
    onDone();
  };

  return (
    <form className="form" onSubmit={submit}>
      <input className="input big" placeholder="ما المهمة؟" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus={!task} enterKeyHint="done" />

      <Seg<TaskScope>
        value={scope}
        onChange={setScope}
        options={[{ key: 'personal', label: '👤 شخصية' }, { key: 'shared', label: '👩‍❤️‍👨 مشتركة' }]}
      />

      {scope === 'personal' && partner && (
        <Field label="المسؤول">
          <div className="chips-wrap">
            {[me, partner].map((m) => (
              <button type="button" key={m.id} className={`chip${assignee === m.id ? ' on' : ''}`} onClick={() => setAssignee(m.id)}>
                <Avatar m={m} size="xs" /> {m.id === me.id ? 'أنا' : m.name}
              </button>
            ))}
          </div>
        </Field>
      )}

      <Field label="الموعد">
        <DuePicker value={due} onChange={setDue} />
      </Field>

      <Field label="الأولوية">
        <div className="chips-wrap">
          {PRIORITIES.map((p) => (
            <button type="button" key={p.key} className={`chip${priority === p.key ? ' on' : ''}`} onClick={() => setPriority(p.key)}>
              <i className="prio" style={{ background: p.color }} /> {p.label}
            </button>
          ))}
        </div>
      </Field>

      {task && (
        <Field label="الحالة">
          <Seg<TaskStatus> value={status} onChange={setStatus} options={TASK_STATUSES.map((s) => ({ key: s.key, label: s.label }))} />
        </Field>
      )}

      <Field label="ملاحظات">
        <textarea className="textarea" placeholder="تفاصيل إضافية (اختياري)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </Field>

      <div className="form-actions">
        {task && <button type="button" className="btn btn-soft-danger" style={{ flex: 'none', width: 52, padding: 0 }} onClick={remove} aria-label="حذف"><Trash2 size={20} /></button>}
        <button className="btn btn-primary" disabled={!title.trim()}>{task ? 'حفظ' : 'إضافة المهمة'}</button>
      </div>
    </form>
  );
}
