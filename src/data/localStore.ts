import { clean, type HouseholdStore, type QueryOpts } from './store';
import type { CollectionName, Household } from './types';
import { uid as newId } from '@/lib/ids';

/**
 * Local demo store. Persists to localStorage and syncs live between
 * browser tabs via BroadcastChannel — open two tabs, sign in as each
 * partner, and you get a realistic "two phones" experience offline.
 */
const KEY = 'oh.demo.db.v1';
type Row = Record<string, unknown> & { id: string };
interface DB {
  household: Household | null;
  cols: Partial<Record<CollectionName, Record<string, Row>>>;
}

const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('oh-demo') : null;
const listeners = new Set<() => void>();

function read(): DB {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as DB;
  } catch { /* ignore */ }
  return { household: null, cols: {} };
}
let cache: DB = read();

function write(db: DB) {
  cache = db;
  localStorage.setItem(KEY, JSON.stringify(db));
  emit();
  channel?.postMessage('changed');
}
function emit() { listeners.forEach((l) => l()); }

channel?.addEventListener('message', () => { cache = read(); emit(); });
window.addEventListener('storage', (e) => { if (e.key === KEY) { cache = read(); emit(); } });

export const demoDb = {
  get: () => cache,
  write,
  reset() { localStorage.removeItem(KEY); cache = { household: null, cols: {} }; emit(); channel?.postMessage('changed'); },
};

function sortRows(rows: Row[], opts: QueryOpts) {
  let out = rows;
  if (opts.orderBy) {
    const k = opts.orderBy;
    const m = opts.dir === 'asc' ? 1 : -1;
    out = [...rows].sort((a, b) => ((a[k] as number) > (b[k] as number) ? m : (a[k] as number) < (b[k] as number) ? -m : 0));
  }
  return opts.limit ? out.slice(0, opts.limit) : out;
}

export function createLocalStore(): HouseholdStore {
  const mutate = (col: CollectionName, fn: (rows: Record<string, Row>) => void) => {
    const db = structuredClone(cache);
    const rows = (db.cols[col] ??= {});
    fn(rows);
    write(db);
  };

  return {
    subscribe(col, opts, cb) {
      let last = '';
      const run = () => {
        const rows = sortRows(Object.values(cache.cols[col] ?? {}), opts);
        const sig = JSON.stringify(rows);
        if (sig !== last) { last = sig; cb(rows as never); }
      };
      listeners.add(run);
      queueMicrotask(run);
      return () => listeners.delete(run);
    },
    async add(col, data) {
      const id = newId();
      mutate(col, (rows) => { rows[id] = { ...clean(data as object), id }; });
      return id;
    },
    async set(col, id, data, merge = true) {
      mutate(col, (rows) => { rows[id] = { ...(merge ? rows[id] : {}), ...clean(data as object), id }; });
    },
    async update(col, id, patch) {
      mutate(col, (rows) => { if (rows[id]) rows[id] = { ...rows[id], ...clean(patch as object) }; });
    },
    async remove(col, id) {
      mutate(col, (rows) => { delete rows[id]; });
    },
    async arrayAdd(col, id, field, value) {
      mutate(col, (rows) => {
        const r = (rows[id] ??= { id });
        const arr = (r[field] as string[] | undefined) ?? [];
        if (!arr.includes(value)) r[field] = [...arr, value];
      });
    },
    subscribeHousehold(cb) {
      let last = '';
      const run = () => {
        const sig = JSON.stringify(cache.household);
        if (sig !== last) { last = sig; cb(cache.household); }
      };
      listeners.add(run);
      queueMicrotask(run);
      return () => listeners.delete(run);
    },
    async updateHousehold(patch) {
      const db = structuredClone(cache);
      if (db.household) db.household = { ...db.household, ...clean(patch) };
      write(db);
    },
  };
}
