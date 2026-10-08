// Static catalogs used across features. Keep UI vocab in one place.

export const STATUS_PRESETS = [
  { key: 'home', label: 'في البيت', emoji: '🏠' },
  { key: 'work', label: 'في العمل', emoji: '💼' },
  { key: 'road', label: 'في الطريق', emoji: '🚗' },
  { key: 'shopping', label: 'أتسوق', emoji: '🛍️' },
  { key: 'busy', label: 'مشغول', emoji: '⛔' },
  { key: 'sleep', label: 'نائم', emoji: '😴' },
  { key: 'free', label: 'متاح', emoji: '☕' },
  { key: 'pray', label: 'أصلي', emoji: '🕌' },
] as const;

export const NEED_CATEGORIES = [
  { key: 'food', label: 'بقالة', emoji: '🥖' },
  { key: 'veg', label: 'خضار وفواكه', emoji: '🥬' },
  { key: 'clean', label: 'تنظيف', emoji: '🧴' },
  { key: 'home', label: 'للبيت', emoji: '🛋️' },
  { key: 'health', label: 'صحة', emoji: '💊' },
  { key: 'other', label: 'أخرى', emoji: '📦' },
] as const;

export const EXPENSE_CATEGORIES = [
  { key: 'groceries', label: 'بقالة', emoji: '🛒', color: '#22C55E' },
  { key: 'bills', label: 'فواتير', emoji: '💡', color: '#F59E0B' },
  { key: 'rent', label: 'إيجار', emoji: '🏠', color: '#8B5CF6' },
  { key: 'food', label: 'مطاعم', emoji: '🍽️', color: '#EF4444' },
  { key: 'transport', label: 'مواصلات', emoji: '🚗', color: '#3B82F6' },
  { key: 'health', label: 'صحة', emoji: '💊', color: '#14B8A6' },
  { key: 'fun', label: 'ترفيه', emoji: '🎉', color: '#EC4899' },
  { key: 'other', label: 'أخرى', emoji: '📦', color: '#94A3B8' },
] as const;

export const PRIORITIES = [
  { key: 'high', label: 'عالية', color: 'var(--red)' },
  { key: 'normal', label: 'عادية', color: 'var(--amber)' },
  { key: 'low', label: 'منخفضة', color: 'var(--green)' },
] as const;

export const TASK_STATUSES = [
  { key: 'todo', label: 'جديدة' },
  { key: 'doing', label: 'قيد التنفيذ' },
  { key: 'done', label: 'مكتملة' },
  { key: 'postponed', label: 'مؤجلة' },
  { key: 'forgot', label: 'نسيتها' },
  { key: 'failed', label: 'لم يتم إنجازها' },
] as const;

export const NEED_STATUSES = [
  { key: 'needed', label: 'مطلوب' },
  { key: 'bought', label: 'تم الشراء' },
  { key: 'postponed', label: 'مؤجل' },
  { key: 'forgot', label: 'نسيت شراءه' },
  { key: 'failed', label: 'لم يتم' },
] as const;

export const MEMBER_COLORS = ['#6D5BFF', '#F0567A', '#0EA5E9', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#14B8A6'];
export const MEMBER_EMOJIS = ['👨', '👩', '🧔', '👱‍♀️', '🧕', '👨‍💻', '👩‍💻', '🦁', '🌸', '🌙', '⭐', '🐻'];
export const GOAL_EMOJIS = ['💰', '✈️', '🏡', '🚗', '💍', '📚', '🕋', '👶', '🎁', '💪', '🛋️', '🎯'];
export const EVENT_EMOJIS = ['📅', '🩺', '🎂', '✈️', '👪', '🍽️', '🏦', '🎓', '🛠️', '💐'];
export const NOTE_COLORS = ['#FFE58F', '#FFC9D6', '#C8F2D9', '#CFE3FF', '#E6DAFF', '#FFD9B8'];

export const CURRENCIES = ['ر.س', 'د.إ', 'د.ك', 'ر.ق', 'د.ب', 'ر.ع', 'د.أ', 'د.ع', 'ج.م', 'د.م', '$', '€', '₺'];

export const EMERGENCY_PRESETS = [
  'اتصل بي فورًا 📞',
  'أحتاجك الآن 🙏',
  'تعال للبيت بسرعة 🏠',
  'لا تتأخر، أمر مهم ⏰',
];

export function catOf<T extends { key: string }>(list: readonly T[], key: string | undefined): T {
  return list.find((c) => c.key === key) ?? list[list.length - 1];
}
