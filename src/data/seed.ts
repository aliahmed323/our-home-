import { demoDb } from './localStore';
import { addDays, todayISO } from '@/lib/dates';
import { uid } from '@/lib/ids';
import type { CollectionName } from './types';

export const DEMO_USERS = [
  { id: 'demo-me', name: 'علي', emoji: '👨', color: '#6D5BFF' },
  { id: 'demo-wife', name: 'هيو', emoji: '👩', color: '#F0567A' },
];

/** Populate the local demo household with realistic sample data. */
export function seedDemo() {
  const [A, B] = DEMO_USERS.map((u) => u.id);
  const now = Date.now();
  const min = 60_000;
  const d = (n: number) => todayISO(addDays(new Date(), n));
  const cols: Partial<Record<CollectionName, Record<string, Record<string, unknown> & { id: string }>>> = {};
  const put = (col: CollectionName, row: Record<string, unknown>) => {
    const id = (row.id as string) || (uid() + Math.random().toString(36).slice(2, 5));
    (cols[col] ??= {})[id] = { ...row, id } as any;
  };

  put('members', { ...DEMO_USERS[0], joinedAt: now, status: { key: 'work', label: 'في العمل', emoji: '💼', at: now - 95 * min } });
  put('members', { ...DEMO_USERS[1], joinedAt: now, status: { key: 'home', label: 'في البيت', emoji: '🏠', at: now - 20 * min } });
  // members are keyed by uid
  cols.members = Object.fromEntries(Object.values(cols.members!).map((m) => [m.id, m]));

  put('needs', { title: 'حليب', qty: '2 لتر', category: 'food', status: 'needed', createdBy: B, createdAt: now - 40 * min, buyer: A, urgent: true });
  put('needs', { title: 'خبز', category: 'food', status: 'needed', createdBy: B, createdAt: now - 38 * min });
  put('needs', { title: 'منظف أرضيات', category: 'clean', status: 'needed', createdBy: A, createdAt: now - 300 * min, buyer: null });
  put('needs', { title: 'طماطم', qty: '1 كيلو', category: 'veg', status: 'needed', createdBy: B, createdAt: now - 25 * min });
  put('needs', { title: 'بيض', qty: 'طبق', category: 'food', status: 'bought', createdBy: A, createdAt: now - 2000 * min, boughtAt: now - 600 * min, boughtBy: A });

  put('tasks', { title: 'تجديد تأمين السيارة', scope: 'personal', assignee: A, priority: 'high', status: 'todo', due: d(1), createdBy: A, createdAt: now - 3000 * min });
  put('tasks', { title: 'دفع فاتورة الإنترنت', scope: 'personal', assignee: A, priority: 'normal', status: 'doing', due: d(0), createdBy: B, createdAt: now - 500 * min });
  put('tasks', { title: 'إصلاح صنبور المطبخ', scope: 'personal', assignee: A, priority: 'low', status: 'todo', due: d(4), createdBy: B, createdAt: now - 200 * min });
  put('tasks', { title: 'حجز موعد طبيب الأسنان', scope: 'personal', assignee: B, priority: 'normal', status: 'todo', due: d(2), createdBy: B, createdAt: now - 100 * min });
  put('tasks', { title: 'شراء هدية لأمي', scope: 'personal', assignee: B, priority: 'high', status: 'todo', due: d(3), createdBy: B, createdAt: now - 90 * min });
  put('tasks', { title: 'ترتيب غرفة الضيوف', scope: 'shared', assignee: 'both', priority: 'normal', status: 'todo', due: d(5), createdBy: B, createdAt: now - 800 * min });
  put('tasks', { title: 'التخطيط لإجازة الصيف', scope: 'shared', assignee: 'both', priority: 'low', status: 'doing', createdBy: A, createdAt: now - 4000 * min });
  put('tasks', { title: 'زيارة أهل سارة', scope: 'shared', assignee: 'both', priority: 'high', status: 'todo', due: d(2), createdBy: A, createdAt: now - 60 * min });
  put('tasks', { title: 'تنظيف المكيفات', scope: 'shared', assignee: 'both', priority: 'normal', status: 'done', createdBy: A, createdAt: now - 9000 * min, doneAt: now - 1000 * min, doneBy: B });

  put('events', { title: 'موعد طبيب الأطفال', emoji: '🩺', date: d(2), time: '17:30', createdBy: B, createdAt: now - 1000 * min });
  put('events', { title: 'عشاء عائلي', emoji: '🍽️', date: d(4), time: '20:00', createdBy: A, createdAt: now - 1000 * min });
  put('events', { title: 'عيد ميلاد سارة', emoji: '🎂', date: d(12), createdBy: A, createdAt: now - 1000 * min });

  const m = todayISO().slice(0, 8);
  put('expenses', { title: 'مشتريات الأسبوع', amount: 420, category: 'groceries', paidBy: A, date: `${m}02`, createdBy: A, createdAt: now - 6000 * min });
  put('expenses', { title: 'فاتورة الكهرباء', amount: 310, category: 'bills', paidBy: A, date: `${m}03`, createdBy: A, createdAt: now - 5000 * min });
  put('expenses', { title: 'عشاء خارج البيت', amount: 185, category: 'food', paidBy: B, date: `${m}05`, createdBy: B, createdAt: now - 3000 * min });
  put('expenses', { title: 'بنزين', amount: 120, category: 'transport', paidBy: A, date: todayISO(), createdBy: A, createdAt: now - 200 * min });
  put('expenses', { title: 'صيدلية', amount: 64, category: 'health', paidBy: B, date: todayISO(), createdBy: B, createdAt: now - 50 * min });

  put('goals', { title: 'رحلة الصيف', emoji: '✈️', target: 12000, current: 7400, unit: 'د.ع', deadline: d(120), createdBy: A, createdAt: now - 20000 * min });
  put('goals', { title: 'صندوق الطوارئ', emoji: '💰', target: 20000, current: 5200, unit: 'د.ع', createdBy: B, createdAt: now - 20000 * min });
  put('goals', { title: 'كنبة جديدة', emoji: '🛋️', target: 3500, current: 3100, unit: 'د.ع', createdBy: B, createdAt: now - 9000 * min });

  put('notes', { text: 'كود بوابة العمارة: 4590#', color: '#FFE58F', pinned: true, createdBy: A, createdAt: now - 9000 * min });
  put('notes', { text: 'لا تنسَ تشغيل الغسالة قبل النوم 🧺', color: '#FFC9D6', createdBy: B, createdAt: now - 70 * min });

  put('activity', { type: 'need', text: 'أضافت سارة «طماطم» للمشتريات', emoji: '🛒', notify: true, createdBy: B, createdAt: now - 25 * min });
  put('activity', { type: 'status', text: 'سارة الآن: في البيت 🏠', emoji: '🟢', notify: false, createdBy: B, createdAt: now - 20 * min });
  put('activity', { type: 'expense', text: 'سجلت سارة مصروف «صيدلية» 64 د.ع', emoji: '💰', notify: true, createdBy: B, createdAt: now - 50 * min });
  put('activity', { type: 'task', text: 'أضاف أحمد مهمة «زيارة أهل سارة»', emoji: '✅', notify: true, createdBy: A, createdAt: now - 60 * min });
  put('activity', { type: 'task_done', text: 'أنجزت سارة «تنظيف المكيفات» 🎉', emoji: '🎉', notify: true, createdBy: B, createdAt: now - 1000 * min });

  demoDb.write({
    household: { id: 'DEMO42', name: 'بيتنا', members: [A, B], currency: 'د.ع', createdAt: now },
    cols,
  });
}
