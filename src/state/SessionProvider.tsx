import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { auth, watchUserHousehold, type SessionUser } from '@/services/session';
import { IS_DEMO } from '@/lib/config';
import type { HouseholdStore } from '@/data/store';
import { createLocalStore } from '@/data/localStore';
import { createFirestoreStore } from '@/data/firestoreStore';

export type Session =
  | { phase: 'loading' }
  | { phase: 'signedOut' }
  | { phase: 'onboarding'; user: SessionUser }
  | { phase: 'ready'; user: SessionUser; hid: string; store: HouseholdStore };

const Ctx = createContext<Session>({ phase: 'loading' });
export const useSession = () => useContext(Ctx);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined);
  const [hid, setHid] = useState<string | null | undefined>(undefined);

  useEffect(() => auth.onChange(setUser), []);

  useEffect(() => {
    setHid(undefined);
    if (!user) return;
    return watchUserHousehold(user.uid, setHid);
  }, [user]);

  const session = useMemo<Session>(() => {
    if (user === undefined) return { phase: 'loading' };
    if (user === null) return { phase: 'signedOut' };
    if (hid === undefined) return { phase: 'loading' };
    if (hid === null) return { phase: 'onboarding', user };
    const store = IS_DEMO ? createLocalStore() : createFirestoreStore(hid);
    return { phase: 'ready', user, hid, store };
  }, [user, hid]);

  return <Ctx.Provider value={session}>{children}</Ctx.Provider>;
}
