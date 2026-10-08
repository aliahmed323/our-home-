// Date / number formatting helpers (Arabic UI, Western digits for readability).

export const LOCALE = 'ar-u-nu-latn-ca-gregory';

export function todayISO(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseISO(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function daysBetween(a: Date, b: Date): number {
  const A = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const B = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return Math.round((B - A) / 86400000);
}

const fmtCache = new Map<string, Intl.DateTimeFormat>();
export function fmt(d: Date, opts: Intl.DateTimeFormatOptions): string {
  const k = JSON.stringify(opts);
  let f = fmtCache.get(k);
  if (!f) { f = new Intl.DateTimeFormat(LOCALE, opts); fmtCache.set(k, f); }
  return f.format(d);
}

/** "اليوم" / "غدًا" / "أمس" / "بعد ٣ أيام" / "الخميس ١٢ أكتوبر" */
export function dueLabel(iso: string): { text: string; tone: 'late' | 'today' | 'soon' | 'later' } {
  const diff = daysBetween(new Date(), parseISO(iso));
  if (diff < 0) return { text: diff === -1 ? 'أمس' : `متأخر ${-diff} أيام`, tone: 'late' };
  if (diff === 0) return { text: 'اليوم', tone: 'today' };
  if (diff === 1) return { text: 'غدًا', tone: 'soon' };
  if (diff < 7) return { text: fmt(parseISO(iso), { weekday: 'long' }), tone: 'soon' };
  return { text: fmt(parseISO(iso), { day: 'numeric', month: 'short' }), tone: 'later' };
}

const rtf = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto', style: 'short' });
export function timeAgo(ms: number): string {
  const s = Math.round((ms - Date.now()) / 1000);
  const a = Math.abs(s);
  if (a < 45) return 'الآن';
  if (a < 3600) return rtf.format(Math.round(s / 60), 'minute');
  if (a < 86400) return rtf.format(Math.round(s / 3600), 'hour');
  if (a < 86400 * 7) return rtf.format(Math.round(s / 86400), 'day');
  return fmt(new Date(ms), { day: 'numeric', month: 'short' });
}

export function greeting(d = new Date()): string {
  const h = d.getHours();
  if (h < 5) return 'ليلة سعيدة';
  if (h < 12) return 'صباح الخير';
  if (h < 17) return 'نهارك سعيد';
  return 'مساء الخير';
}

export function money(n: number, currency: string): string {
  const v = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: n % 1 ? 2 : 0 }).format(n);
  return `${v} ${currency}`;
}

export function num(n: number): string {
  return new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 1 }).format(n);
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}
