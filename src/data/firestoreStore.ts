import {
  addDoc, arrayUnion, collection, deleteDoc, doc, limit as qLimit, onSnapshot,
  orderBy as qOrderBy, query, setDoc, updateDoc, type QueryConstraint,
} from 'firebase/firestore';
import { fb } from '@/lib/firebase';
import { clean, type HouseholdStore } from './store';
import type { Household } from './types';

/** Firestore implementation: households/{hid}/{collection}/{docId} */
export function createFirestoreStore(hid: string): HouseholdStore {
  const { db } = fb();
  const colRef = (c: string) => collection(db, 'households', hid, c);
  const docRef = (c: string, id: string) => doc(db, 'households', hid, c, id);

  return {
    subscribe(col, opts, cb) {
      const cs: QueryConstraint[] = [];
      if (opts.orderBy) cs.push(qOrderBy(opts.orderBy, opts.dir ?? 'desc'));
      if (opts.limit) cs.push(qLimit(opts.limit));
      return onSnapshot(
        query(colRef(col), ...cs),
        (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as never)),
        (err) => console.error(`[store] ${col}`, err),
      );
    },
    async add(col, data) {
      const ref = await addDoc(colRef(col), clean(data as object));
      return ref.id;
    },
    async set(col, id, data, merge = true) {
      await setDoc(docRef(col, id), clean(data as object), { merge });
    },
    async update(col, id, patch) {
      await updateDoc(docRef(col, id), clean(patch as object) as never);
    },
    async remove(col, id) {
      await deleteDoc(docRef(col, id));
    },
    async arrayAdd(col, id, field, value) {
      await setDoc(docRef(col, id), { [field]: arrayUnion(value) }, { merge: true });
    },
    subscribeHousehold(cb) {
      return onSnapshot(
        doc(db, 'households', hid),
        (s) => cb(s.exists() ? ({ id: s.id, ...s.data() } as Household) : null),
        (err) => console.error('[store] household', err),
      );
    },
    async updateHousehold(patch) {
      const { id: _id, members: _m, ...rest } = patch;
      await updateDoc(doc(db, 'households', hid), clean(rest));
    },
  };
}
