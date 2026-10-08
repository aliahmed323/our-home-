import { Bell } from 'lucide-react';
import { useData } from '@/state/DataProvider';
import { Card, Empty } from '@/components/ui';
import { timeAgo } from '@/lib/dates';

export function ActivityCard() {
  const { me, activity } = useData();
  
  return (
    <Card icon={<Bell />} tint="var(--card-2)" title="النشاط والإشعارات" sub="ماذا حدث مؤخراً؟">
      <div className="feed" style={{ marginTop: 10 }}>
        {activity.slice(0, 8).map((a) => {
          const isMe = a.createdBy === me.id;
          
          return (
            <div key={a.id} className={`feed-item${!isMe ? ' unread' : ''}`}>
              <div className="fi-ic">{a.emoji}</div>
              <div className="fi-txt">{a.text}</div>
              <div className="fi-time">{timeAgo(a.createdAt)}</div>
            </div>
          );
        })}
        {activity.length === 0 && <Empty emoji="📭" text="لا يوجد نشاط بعد" />}
      </div>
    </Card>
  );
}
