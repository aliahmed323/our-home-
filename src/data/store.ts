import type { CollectionMap, CollectionName } from './types';

export type Unsubscribe = () => void;

export interface QueryOpts {
  orderBy?: string;
  dir?: 'asc' | 'desc';
  limit?: number;
}

type Data<C extends CollectionName> = Omit<CollectionMap[C], 'id'>;

/**
 * Storage-agnostic interface for a single household's data.
 * Implemented by Firestore (real sync) and localStorage (demo mode).
 */
export interface HouseholdStore {
  subscribe<C extends CollectionName>(
    col: C,
    opts: QueryOpts,
    cb: (items: CollectionMap[C][]) => void,
  ): Unsubscribe;
  add<C extends CollectionName>(col: C, data: Data<C>): Promise<string>;
  set<C extends CollectionName>(col: C, id: string, data: Partial<Data<C>>, merge?: boolean): Promise<void>;
  update<C extends CollectionName>(col: C, id: string, patch: Partial<Data<C>>): Promise<void>;
  remove(col: CollectionName, id: string): Promise<void>;
  /** Atomically add a value to an array field (used for FCM tokens). */
  arrayAdd(col: CollectionName, id: string, field: string, value: string): Promise<void>;
  subscribeHousehold(cb: (h: import('./types').Household | null) => void): Unsubscribe;
  updateHousehold(patch: Partial<import('./types').Household>): Promise<void>;
}

/** Remove undefined values (Firestore rejects them). */
export function clean<T extends object>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) if (v !== undefined) out[k] = v;
  return out as T;
}
