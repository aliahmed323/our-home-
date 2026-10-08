// ─────────────────────────────────────────────────────────────
// Domain model. All timestamps are epoch milliseconds (number)
// so the same shapes work for Firestore and the local demo store.
// Dates without time are ISO strings "YYYY-MM-DD".
// ─────────────────────────────────────────────────────────────

export type Uid = string;

export interface BaseDoc {
  id: string;
  createdAt: number;
  createdBy: Uid;
  updatedAt?: number;
}

export interface MemberStatus {
  key: string;
  label: string;
  emoji: string;
  at: number;
}

export interface Member {
  id: Uid;
  name: string;
  emoji: string;
  color: string;
  status?: MemberStatus;
  fcmTokens?: string[];
  joinedAt: number;
}

export interface Household {
  id: string;
  name: string;
  members: Uid[];
  currency: string;
  createdAt: number;
}

export type Priority = 'low' | 'normal' | 'high';
export type TaskStatus = 'todo' | 'doing' | 'done' | 'postponed' | 'forgot' | 'failed';
export type TaskScope = 'personal' | 'shared';

export interface Task extends BaseDoc {
  title: string;
  scope: TaskScope;
  /** uid of the owner for personal tasks, 'both' for shared */
  assignee: Uid | 'both';
  priority: Priority;
  status: TaskStatus;
  due?: string | null;
  notes?: string;
  doneAt?: number | null;
  doneBy?: Uid | null;
}

export type NeedStatus = 'needed' | 'bought' | 'postponed' | 'forgot' | 'failed';

export interface Need extends BaseDoc {
  title: string;
  qty?: string;
  category: string;
  buyer?: Uid | null;
  status: NeedStatus;
  urgent?: boolean;
  boughtAt?: number | null;
  boughtBy?: Uid | null;
}

export interface Expense extends BaseDoc {
  title: string;
  amount: number;
  category: string;
  paidBy: Uid;
  date: string;
}

export interface CalEvent extends BaseDoc {
  title: string;
  date: string;
  time?: string;
  notes?: string;
  emoji?: string;
}

export interface Plan extends BaseDoc {
  title: string;
  notes?: string;
  doneAt?: number | null;
}

export interface Goal extends BaseDoc {
  title: string;
  emoji: string;
  target: number;
  current: number;
  unit: string;
  deadline?: string | null;
}

export interface Note extends BaseDoc {
  text: string;
  color: string;
  pinned?: boolean;
}

export interface Alert extends BaseDoc {
  message: string;
  resolvedAt?: number | null;
  resolvedBy?: Uid | null;
}

export type ActivityType =
  | 'task' | 'task_done' | 'need' | 'need_bought' | 'expense' | 'event'
  | 'goal' | 'goal_progress' | 'note' | 'alert' | 'alert_ack' | 'status' | 'join' | 'plan';

export interface Activity extends BaseDoc {
  type: ActivityType;
  text: string;
  emoji: string;
  /** when true, a push notification is sent to the partner (Cloud Function) */
  notify: boolean;
  urgent?: boolean;
}

export interface CollectionMap {
  tasks: Task;
  needs: Need;
  expenses: Expense;
  events: CalEvent;
  goals: Goal;
  notes: Note;
  alerts: Alert;
  activity: Activity;
  members: Member;
  plans: Plan;
}

export type CollectionName = keyof CollectionMap;
