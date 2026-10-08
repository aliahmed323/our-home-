import type { HouseholdStore } from './store';
import type {
  Activity, ActivityType, Alert, CalEvent, Expense, Goal, Member, Need, Note, Task, Plan, Uid,
} from './types';
import { dueLabel, money, num } from '@/lib/dates';

type New<T> = Omit<T, 'id' | 'createdAt' | 'createdBy'>;

/**
 * All write operations of the app, in one place. Each important mutation
 * also writes an `activity` entry, which (a) feeds the activity card and
 * (b) triggers a push notification to the partner via Cloud Function.
 *
 * Writes are fired without waiting for the server: Firestore applies them
 * to the local cache instantly (optimistic UI) and syncs in the background,
 * so the app stays snappy even offline.
 */
export function createActions(store: HouseholdStore, me: Uid, ctx: () => { members: Record<Uid, Member>; currency: string }) {
    
  const meName = () => ctx().members[me]?.name || 'أنا';
  const v = (m: string, f: string) => {
    const n = meName();
    return (n === 'هيو' || n === 'سارة' || n.endsWith('ة') || n.endsWith('ى') || n.endsWith('اء')) ? f : m;
  };

  const stamp = () => ({ createdAt: Date.now(), createdBy: me });
  const touch = () => ({ updatedAt: Date.now() });

  const log = (type: ActivityType, text: string, emoji: string, notify = true, urgent = false) => {
    store.add('activity', { type, text, emoji, notify, urgent, ...stamp() } as Omit<Activity, 'id'>)
      .catch((e) => console.warn('[activity]', e));
  };

  return {
    log,

    // ── Tasks ──
    addTask(t: New<Task>) {
      const p = store.add('tasks', { ...t, ...stamp() });
      log('task', `${meName()} ${v('أضاف', 'أضافت')} المهمة: ${t.title}`, '✅', t.assignee !== me);
      return p;
    },
    updateTask: (id: string, patch: Partial<Task>) => store.update('tasks', id, { ...patch, ...touch() }),
    setTaskStatus(t: Task, status: Task['status']) {
      const done = status === 'done';
      const p = store.update('tasks', t.id, {
        status, doneAt: done ? Date.now() : null, doneBy: done ? me : null, ...touch(),
      });
      if (done && t.status !== 'done') log('task_done', `${meName()} ${v('أكمل', 'أكملت')} المهمة: ${t.title}`, '🎉', true);
      else if (t.status !== status) log('task', `${meName()} ${v('غيّر', 'غيّرت')} حالة المهمة "${t.title}"`, '🔄', false);
      return p;
    },
    removeTask: (id: string) => store.remove('tasks', id),

    // ── Needs ──
    addNeed(n: Partial<New<Need>> & { title: string }) {
      const p = store.add('needs', { category: 'other', status: 'needed', buyer: null, ...n, ...stamp() } as Omit<Need, 'id'>);
      log('need', `${meName()} ${v('أضاف', 'أضافت')} احتياجاً: ${n.title}`, '🛒', true, !!n.urgent);
      return p;
    },
    updateNeed: (id: string, patch: Partial<Need>) => store.update('needs', id, { ...patch, ...touch() }),
    toggleNeed(n: Need) {
      // Used by inline check, toggles between needed and bought
      const bought = n.status !== 'bought';
      const p = store.update('needs', n.id, {
        status: bought ? 'bought' : 'needed', boughtAt: bought ? Date.now() : null, boughtBy: bought ? me : null,
      });
      if (bought) log('need_bought', `${meName()} ${v('اشترى', 'اشترت')}: ${n.title}`, '🛍️', true);
      return p;
    },
    claimNeed(n: Need) {
      const buyer = n.buyer === me ? null : me;
      const p = store.update('needs', n.id, { buyer });
      if (buyer) log('need', `${meName()} ${v('سيشتري', 'ستشتري')}: ${n.title}`, '🙋', false);
      return p;
    },
    removeNeed: (id: string) => store.remove('needs', id),
    clearBought: (needs: Need[]) =>
      Promise.all(needs.filter((n) => n.status === 'bought').map((n) => store.remove('needs', n.id))),

    // ── Expenses ──
    addExpense(e: New<Expense>) {
      const p = store.add('expenses', { ...e, ...stamp() });
      log('expense', `${meName()} ${v('سجل', 'سجلت')} مصروفاً: ${e.title} — ${money(e.amount, ctx().currency)}`, '💰');
      return p;
    },
    updateExpense: (id: string, patch: Partial<Expense>) => store.update('expenses', id, { ...patch, ...touch() }),
    removeExpense: (id: string) => store.remove('expenses', id),

    // ── Events ──
    addEvent(e: New<CalEvent>) {
      const p = store.add('events', { ...e, ...stamp() });
      log('event', `${meName()} ${v('أضاف', 'أضافت')} موعداً: ${e.title} — ${dueLabel(e.date).text}`, e.emoji || '📅');
      return p;
    },
    updateEvent: (id: string, patch: Partial<CalEvent>) => store.update('events', id, { ...patch, ...touch() }),
    removeEvent: (id: string) => store.remove('events', id),

    // ── Goals ──
    addGoal(g: New<Goal>) {
      const p = store.add('goals', { ...g, ...stamp() });
      log('goal', `${meName()} ${v('أضاف', 'أضافت')} هدفاً: ${g.title}`, '🎯');
      return p;
    },
    updateGoal: (id: string, patch: Partial<Goal>) => store.update('goals', id, { ...patch, ...touch() }),
    contributeGoal(g: Goal, amount: number) {
      const current = Math.max(0, g.current + amount);
      const p = store.update('goals', g.id, { current, ...touch() });
      const pct = Math.min(100, Math.round((current / g.target) * 100));
      if (amount > 0) {
        log('goal_progress', pct >= 100
          ? `${meName()} ${v('حقق', 'حققت')} هدف «${g.title}» 🎉`
          : `${meName()} ${v('أضاف', 'أضافت')} +${num(amount)} ${g.unit} لـ «${g.title}»`, g.emoji);
      }
      return p;
    },
    removeGoal: (id: string) => store.remove('goals', id),

    // ── Notes ──
    addNote(n: New<Note>) {
      const p = store.add('notes', { ...n, ...stamp() });
      log('note', `${meName()} ${v('كتب', 'كتبت')} ملاحظة جديدة`, '📝');
      return p;
    },
    updateNote: (id: string, patch: Partial<Note>) => store.update('notes', id, { ...patch, ...touch() }),
    removeNote: (id: string) => store.remove('notes', id),

    // ── Emergency ──
    sendAlert(message: string) {
      const p = store.add('alerts', { message, resolvedAt: null, resolvedBy: null, ...stamp() } as Omit<Alert, 'id'>);
      log('alert', `${meName()} طلب(ت) أمراً عاجلاً: ${message}`, '🚨', true, true);
      return p;
    },
    resolveAlert(a: Alert) {
      const p = store.update('alerts', a.id, { resolvedAt: Date.now(), resolvedBy: me });
      if (a.createdBy !== me) log('alert_ack', `${meName()} ${v('رأى', 'رأت')} طلبك العاجل 👍`, '✅', true);
      return p;
    },

    // ── Plans ──
    addPlan(p: New<Plan>) {
      const doc = store.add('plans', { ...p, ...stamp() });
      log('plan', `${meName()} ${v('أضاف', 'أضافت')} خطة: ${p.title}`, '💭', true);
      return doc;
    },
    updatePlan: (id: string, patch: Partial<Plan>) => store.update('plans', id, { ...patch, ...touch() }),
    setPlanDone(p: Plan, done: boolean) {
      const doc = store.update('plans', p.id, { doneAt: done ? Date.now() : null, ...touch() });
      if (done && !p.doneAt) log('plan', `${meName()} ${v('أكمل', 'أكملت')} الخطة: ${p.title}`, '🌟', true);
      return doc;
    },
    removePlan: (id: string) => store.remove('plans', id),

    // ── Profile / status ──
    setStatus(s: Omit<NonNullable<Member['status']>, 'at'>) {
      const p = store.set('members', me, { status: { ...s, at: Date.now() } });
      log('status', `${meName()} الآن: ${s.label}`, s.emoji, false);
      return p;
    },
    updateProfile: (p: Partial<Pick<Member, 'name' | 'emoji' | 'color'>>) => store.set('members', me, p),
    updateHousehold: (p: Parameters<HouseholdStore['updateHousehold']>[0]) => store.updateHousehold(p),
  };
}

export type Actions = ReturnType<typeof createActions>;
