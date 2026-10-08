import { useState } from 'react';
import { useData } from '@/state/DataProvider';
import { Avatar } from '@/components/ui';
import { Sheet } from '@/components/Sheet';
import { STATUS_PRESETS } from '@/lib/catalog';
import { timeAgo } from '@/lib/dates';
import { Edit2 } from 'lucide-react';

export function StatusSection() {
  const { me, partner, actions } = useData();
  const [open, setOpen] = useState(false);
  
  const mStatus = me.status ?? (STATUS_PRESETS[0] as any);
  const pStatus = partner?.status ?? (STATUS_PRESETS[0] as any);

  return (
    <>
      <div className="duo" style={{ marginBottom: 16 }}>
        <div className="person me" onClick={() => setOpen(true)}>
          <Edit2 className="edit" size={14} />
          <div className="who">
            <Avatar m={me} size="sm" />
            <div>
              <div className="name">أنا</div>
              <div className="tag">تحديث الحالة</div>
            </div>
          </div>
          <div className="st"><span className="e">{mStatus.emoji}</span> {mStatus.label}</div>
          <div className="ago">{mStatus.at ? `منذ ${timeAgo(mStatus.at)}` : ''}</div>
        </div>

        {partner ? (
          <div className="person">
            <div className="who">
              <Avatar m={partner} size="sm" />
              <div>
                <div className="name">{partner.name}</div>
                <div className="tag">حالة الشريك</div>
              </div>
            </div>
            <div className="st"><span className="e">{pStatus.emoji}</span> {pStatus.label}</div>
            <div className="ago">{pStatus.at ? `منذ ${timeAgo(pStatus.at)}` : ''}</div>
          </div>
        ) : (
          <div className="person" style={{ opacity: 0.5, justifyContent: 'center', alignItems: 'center' }}>
            <div className="muted" style={{ fontSize: 13, textAlign: 'center' }}>في انتظار انضمام شريكك</div>
          </div>
        )}
      </div>

      {open && (
        <Sheet title="ماذا تفعل الآن؟" onClose={() => setOpen(false)}>
          <div className="status-grid">
            {STATUS_PRESETS.map((s) => (
              <button 
                key={s.key} className={`status-opt${mStatus.key === s.key ? ' on' : ''}`}
                onClick={() => { actions.setStatus(s); setOpen(false); }}
              >
                <span className="e">{s.emoji}</span> {s.label}
              </button>
            ))}
          </div>
        </Sheet>
      )}
    </>
  );
}
