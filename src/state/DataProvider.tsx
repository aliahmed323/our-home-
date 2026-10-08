import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { HouseholdStore } from '@/data/store';
import type {
  Activity, Alert, CalEvent, Expense, Goal, Household, Member, Need, Note, Task, Plan, Uid,
} from '@/data/types';
import { createActions, type Actions } from '@/data/actions';
import { useUI } from './UIProvider';
import { localNotify, registerToken, vibrate } from '@/services/notifications';

interface Data {
  ready: boolean;
  me: Member;
  partner: Member | null;
  members: Record<Uid, Member>;
  household: Household | null;
  currency: string;
  tasks: Task[];
  needs: Need[];
  expenses: Expense[];
  events: CalEvent[];
  goals: Goal[];
  notes: Note[];
  alerts: Alert[];
  activity: Activity[];
  plans: Plan[];
  actions: Actions;
  store: HouseholdStore;
}

const Ctx = createContext<Data>(null!);
export const useData = () => useContext(Ctx);

const placeholder = (id: string): Member => ({ id, name: 'أنا', emoji: '🙂', color: '#6D5BFF', joinedAt: 0 });

export function DataProvider({ store, uid, children }: { store: HouseholdStore; uid: Uid; children: ReactNode }) {
  const ui = useUI();
  const [household, setHousehold] = useState<Household | null>(null);
  const [membersList, setMembers] = useState<Member[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [activityInit, setActivityInit] = useState(false);

  // ── Live subscriptions (one listener per collection) ──
  useEffect(() => {
    const subs = [
      store.subscribeHousehold(setHousehold),
      store.subscribe('members', {}, (m) => { setMembers(m); setLoaded(true); }),
      store.subscribe('tasks', { orderBy: 'createdAt', dir: 'desc', limit: 400 }, setTasks),
      store.subscribe('needs', { orderBy: 'createdAt', dir: 'desc', limit: 300 }, setNeeds),
      store.subscribe('expenses', { orderBy: 'date', dir: 'desc', limit: 500 }, setExpenses),
      store.subscribe('events', { orderBy: 'date', dir: 'asc', limit: 300 }, setEvents),
      store.subscribe('goals', { orderBy: 'createdAt', dir: 'asc' }, setGoals),
      store.subscribe('plans', { orderBy: 'createdAt', dir: 'asc' }, setPlans),
      store.subscribe('notes', { orderBy: 'createdAt', dir: 'desc', limit: 100 }, setNotes),
      store.subscribe('alerts', { orderBy: 'createdAt', dir: 'desc', limit: 20 }, setAlerts),
      store.subscribe('activity', { orderBy: 'createdAt', dir: 'desc', limit: 60 }, (a) => { setActivity(a); setActivityInit(true); }),
    ];
    return () => subs.forEach((u) => u());
  }, [store]);

  const members = useMemo(() => Object.fromEntries(membersList.map((m) => [m.id, m])), [membersList]);
  const me = members[uid] ?? placeholder(uid);
  const partner = membersList.find((m) => m.id !== uid) ?? null;
  const currency = household?.currency ?? 'ر.س';

  const ctxRef = useRef({ members, currency });
  ctxRef.current = { members, currency };
  const actions = useMemo(() => createActions(store, uid, () => ctxRef.current), [store, uid]);

  // ── Refresh push token once per session ──
  useEffect(() => { registerToken(store, uid); }, [store, uid]);

  // ── Real-time "partner did something" notifications ──
  const seen = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (!activityInit) return;
    if (!seen.current) { seen.current = new Set(activity.map((a) => a.id)); return; }
    const fresh = activity.filter((a) => !seen.current!.has(a.id));
    fresh.forEach((a) => seen.current!.add(a.id));
    for (const a of fresh.reverse()) {
      if (a.createdBy === uid || Date.now() - a.createdAt > 5 * 60_000) continue;
      ui.toast({ emoji: a.emoji, text: a.text, urgent: a.urgent });
      vibrate(a.urgent ? [300, 100, 300, 100, 600] : 15);
      if (document.hidden && a.notify) localNotify(`${a.emoji} الإشعارات`, a.text, a.id, a.urgent);
    }
  }, [activity, activityInit, uid, members, ui]);

  const value: Data = {
    ready: loaded, me, partner, members, household, currency,
    tasks, needs, expenses, events, goals, plans, notes, alerts, activity, actions, store,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
