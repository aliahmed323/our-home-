import { useSession } from '@/state/SessionProvider';
import { DataProvider } from '@/state/DataProvider';
import { Onboarding } from './Onboarding';
import { Dashboard } from './Dashboard';
import { Loader2 } from 'lucide-react';

export function App() {
  const session = useSession();

  if (session.phase === 'loading') {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)' }}>
        <Loader2 className="spin" size={32} />
      </div>
    );
  }

  // If ready, we have a user, a household, and an initialized store
  if (session.phase === 'ready') {
    return (
      <DataProvider store={session.store} uid={session.user.uid}>
        <Dashboard />
      </DataProvider>
    );
  }

  // Otherwise, user is either not logged in or hasn't joined/created a household yet
  return <Onboarding />;
}
