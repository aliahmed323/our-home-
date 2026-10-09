import {
  GoogleAuthProvider, createUserWithEmailAndPassword, onAuthStateChanged,
  signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, signOut as fbSignOut,
  updateProfile,
} from 'firebase/auth';
import { arrayUnion, doc, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { IS_DEMO } from '@/lib/config';
import { fb } from '@/lib/firebase';
import { inviteCode } from '@/lib/ids';
import type { Member } from '@/data/types';
import { demoDb } from '@/data/localStore';
import { seedDemo, DEMO_USERS } from '@/data/seed';

export interface SessionUser {
  uid: string;
  email?: string | null;
  displayName?: string | null;
}
type Unsub = () => void;
export type ProfileInput = Pick<Member, 'name' | 'emoji' | 'color'>;

// ───────────────────────── Auth ─────────────────────────

const DEMO_KEY = 'oh.demo.user'; // sessionStorage → each tab can be a different partner
const demoListeners = new Set<(u: SessionUser | null) => void>();
function demoUser(): SessionUser | null {
  const id = sessionStorage.getItem(DEMO_KEY);
  const u = DEMO_USERS.find((d) => d.id === id);
  return u ? { uid: u.id, displayName: u.name } : null;
}

export const auth = {
  onChange(cb: (u: SessionUser | null) => void): Unsub {
    if (IS_DEMO) {
      demoListeners.add(cb);
      queueMicrotask(() => cb(demoUser()));
      return () => demoListeners.delete(cb);
    }
    return onAuthStateChanged(fb().auth, (u) =>
      cb(u ? { uid: u.uid, email: u.email, displayName: u.displayName } : null),
    );
  },

  async signInDemo(id: string) {
    sessionStorage.setItem(DEMO_KEY, id);
    if (!demoDb.get().household) seedDemo();
    demoListeners.forEach((l) => l(demoUser()));
  },

  async signInGoogle() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(fb().auth, provider);
    } catch (e: unknown) {
      const code = (e as { code?: string }).code ?? '';
      if (code.includes('popup-blocked') || code.includes('operation-not-supported')) {
        await signInWithRedirect(fb().auth, provider);
      } else throw e;
    }
  },

  async signInEmail(email: string, password: string) {
    await signInWithEmailAndPassword(fb().auth, email.trim(), password);
  },

  async signUpEmail(email: string, password: string, name?: string) {
    const cred = await createUserWithEmailAndPassword(fb().auth, email.trim(), password);
    if (name) await updateProfile(cred.user, { displayName: name });
  },

  async signOut() {
    if (IS_DEMO) {
      sessionStorage.removeItem(DEMO_KEY);
      demoListeners.forEach((l) => l(null));
      return;
    }
    await fbSignOut(fb().auth);
  },
};

// ───────────────────────── Household membership ─────────────────────────

/** Watches users/{uid}.householdId */
export function watchUserHousehold(uid: string, cb: (hid: string | null) => void): Unsub {
  if (IS_DEMO) {
    queueMicrotask(() => cb(demoDb.get().household?.id ?? null));
    return () => {};
  }
  return onSnapshot(
    doc(fb().db, 'users', uid),
    (s) => cb((s.data()?.householdId as string | undefined) ?? null),
    (err) => { console.error(err); cb(null); },
  );
}

export async function createHousehold(uid: string, profile: ProfileInput): Promise<string> {
  const { db } = fb();
  // Household id doubles as the invite code. Retry on the (very unlikely) collision.
  for (let i = 0; i < 5; i++) {
    const code = inviteCode();
    const ref = doc(db, 'households', code);
    try {
      await setDoc(ref, { name: 'بيتنا', members: [uid], currency: 'د.ع', createdAt: Date.now() });
    } catch {
      continue; // exists & not ours → permission denied
    }
    await setDoc(doc(db, 'households', code, 'members', uid), { ...profile, joinedAt: Date.now() }, { merge: true });
    await setDoc(doc(db, 'users', uid), { householdId: code }, { merge: true });
    return code;
  }
  throw new Error('تعذر إنشاء البيت، حاول مرة أخرى');
}

export async function joinHousehold(uid: string, rawCode: string, profile: ProfileInput): Promise<string> {
  const { db } = fb();
  const code = rawCode.trim().toUpperCase();
  const ref = doc(db, 'households', code);
  try {
    await updateDoc(ref, { members: arrayUnion(uid) });
  } catch (e: unknown) {
    const c = (e as { code?: string }).code ?? '';
    if (c.includes('not-found')) throw new Error('الكود غير صحيح');
    // Already a member? Then the read below will succeed.
    const snap = await getDoc(ref).catch(() => null);
    if (!snap?.exists()) throw new Error('الكود غير صحيح أو أن البيت مكتمل');
  }
  await setDoc(doc(db, 'households', code, 'members', uid), { ...profile, joinedAt: Date.now() }, { merge: true });
  await setDoc(doc(db, 'users', uid), { householdId: code }, { merge: true });
  await setDoc(doc(db, 'households', code, 'activity', `join_${uid}`), {
    type: 'join', text: `${profile.name} انضم إلى البيت`, emoji: '🎉', notify: true,
    createdAt: Date.now(), createdBy: uid,
  });
  return code;
}
