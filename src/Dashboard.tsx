import { StatusSection } from '@/features/status/StatusSection';
import { TasksCard } from '@/features/tasks/TasksCard';
import { NeedsCard } from '@/features/needs/NeedsCard';
import { ExpensesCard } from '@/features/expenses/ExpensesCard';
import { EventsCard } from '@/features/events/EventsCard';
import { GoalsSection } from '@/features/goals/GoalsSection';
import { NotesSection } from '@/features/notes/NotesSection';
import { ActivityCard } from '@/features/activity/ActivityCard';
import { FabMenu } from '@/components/QuickAdd';
import { Topbar } from '@/components/Topbar';
import { useData } from '@/state/DataProvider';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { PlansCard } from '@/features/plans/PlansCard';

function InviteBanner() {
  const { household, partner } = useData();
  const [copied, setCopied] = useState(false);

  if (partner || !household) return null;

  const copy = () => {
    navigator.clipboard.writeText(household.id).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="invite" style={{ marginBottom: 20 }}>
      <h3>في انتظار شريكك 👩‍❤️‍👨</h3>
      <p>تطبيق "بيتنا" مصمم لشخصين. أرسل هذا الكود لشريكك لينضم إليك وتتزامن بياناتكما فوراً.</p>
      <div className="code">
        {household.id}
        <button className="icon-btn sm" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }} onClick={copy}>
          {copied ? <Check size={18} /> : <Copy size={18} />}
        </button>
      </div>
    </div>
  );
}

export function Dashboard() {
  return (
    <div className="app">
      <Topbar />
      <InviteBanner />
      <StatusSection />
      
      <div className="dash-grid" style={{ marginBottom: 14 }}>
        <ActivityCard />
      </div>
      
      <div className="dash-grid">
        <NeedsCard />
        <TasksCard />
        <ExpensesCard />
        <EventsCard />
      </div>

      <div style={{ height: 24 }} />
      <div className="dash-grid">
        <PlansCard />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <GoalsSection />
          <NotesSection />
        </div>
      </div>

      <FabMenu />
    </div>
  );
}
