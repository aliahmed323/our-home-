import { useState } from 'react';
import { ShoppingCart, Plus, CheckCircle as CheckCircleIcon } from 'lucide-react';
import { useData } from '@/state/DataProvider';
import { useUI } from '@/state/UIProvider';
import { Card, CheckCircle, Empty } from '@/components/ui';
import { NeedForm } from './NeedForm';
import { timeAgo } from '@/lib/dates';
import type { Need } from '@/data/types';

export function NeedsCard() {
  const { me, partner, needs, actions } = useData();
  const ui = useUI();
  const [quickTitle, setQuickTitle] = useState('');

  const active = needs.filter((n) => n.status === 'needed');
  const bought = needs.filter((n) => n.status === 'bought').slice(0, 5); // recent 5

  const addQuick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    actions.addNeed({ title: quickTitle.trim() });
    setQuickTitle('');
  };

  const claim = (e: React.MouseEvent, n: Need) => {
    e.stopPropagation();
    actions.claimNeed(n);
  };

  const openNeed = (n: Need) => ui.open((c) => <NeedForm need={n} onDone={c} />, { title: 'تعديل الاحتياج' });

  return (
    <Card 
      icon={<ShoppingCart />} tint="var(--blue-soft)" title="المشتريات" 
      sub={`${active.length} أشياء ناقصة`} className="span-all"
    >
      <div className="list">
        {active.map((n) => (
          <div key={n.id} className="row tap" onClick={() => openNeed(n)}>
            <CheckCircle on={false} onClick={() => actions.toggleNeed(n)} color="var(--blue)" />
            <div className="row-main">
              <div className="row-title" style={{ color: n.urgent ? 'var(--red)' : undefined }}>
                {n.title} {n.qty && <span className="muted">({n.qty})</span>}
                {n.urgent && ' 🚨'}
              </div>
              <div className="row-meta">
                أضافه {n.createdBy === me.id ? 'أنا' : partner?.name || 'شريكك'} • {timeAgo(n.createdAt)}
              </div>
            </div>
            {partner && (
              <button 
                className={`chip${n.buyer === me.id ? ' on' : n.buyer ? ' on-brand' : ''}`}
                onClick={(e) => claim(e, n)} style={{ height: 28, fontSize: 12, padding: '0 10px' }}
              >
                {n.buyer === me.id ? 'سأشتريه' : n.buyer === partner.id ? `${partner.name} سيشتريه` : 'أنا سأشتريه؟'}
              </button>
            )}
          </div>
        ))}
        {active.length === 0 && bought.length === 0 && <Empty emoji="🛒" text="لا يوجد نواقص حالياً" />}
      </div>

      <form className="inline-add" onSubmit={addQuick}>
        <Plus size={20} className="muted" style={{ marginLeft: 8 }} />
        <input placeholder="إضافة سريعة للمشتريات..." value={quickTitle} onChange={(e) => setQuickTitle(e.target.value)} enterKeyHint="send" />
        <button type="submit" className="go" disabled={!quickTitle.trim()}><ShoppingCart size={16} /></button>
      </form>

      {bought.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-3)', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span>تم شراؤه مؤخراً</span>
            <button onClick={() => actions.clearBought(bought)} style={{ color: 'var(--red)' }}>مسح</button>
          </div>
          <div className="list">
            {bought.map((n) => (
              <div key={n.id} className="row done tap" onClick={() => openNeed(n)}>
                <CheckCircleIcon size={24} color="var(--blue)" style={{ flex: 'none' }} />
                <div className="row-main">
                  <div className="row-title">{n.title}</div>
                  <div className="row-meta">اشتراه {n.boughtBy === me.id ? 'أنا' : partner?.name || 'شريكك'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
