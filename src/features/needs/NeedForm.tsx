import { useState, type FormEvent } from 'react';
import { Trash2 } from 'lucide-react';
import { useData } from '@/state/DataProvider';
import { useUI } from '@/state/UIProvider';
import type { Need } from '@/data/types';
import { NEED_CATEGORIES, NEED_STATUSES } from '@/lib/catalog';
import { Field, Switch, Avatar, Seg } from '@/components/ui';
import type { NeedStatus } from '@/data/types';

export function NeedForm({ need, onDone }: { need?: Need; onDone: () => void }) {
  const { me, partner, actions } = useData();
  const ui = useUI();
  
  const aliId = me.name === 'علي' ? me.id : (partner?.name === 'علي' ? partner.id : me.id);
  
  const [title, setTitle] = useState(need?.title ?? '');
  const [qty, setQty] = useState(need?.qty ?? '');
  const [category, setCategory] = useState(need?.category ?? 'food');
  const [buyer, setBuyer] = useState<string | null>(need?.buyer !== undefined ? need.buyer : aliId);
  const [status, setStatus] = useState<NeedStatus>(need?.status ?? 'needed');
  const [urgent, setUrgent] = useState(need?.urgent ?? false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const data = { title: title.trim(), qty: qty.trim(), category, urgent, buyer, status };
    const p = need
      ? actions.updateNeed(need.id, data)
      : actions.addNeed(data);
    p.catch(() => ui.toast({ emoji: '⚠️', text: 'تعذر الحفظ' }));
    if (!need) ui.toast({ emoji: '🛒', text: 'تمت الإضافة للمشتريات' });
    onDone();
  };

  const remove = () => {
    if (!need) return;
    actions.removeNeed(need.id);
    ui.toast({ emoji: '🗑️', text: 'تم الحذف' });
    onDone();
  };

  return (
    <form className="form" onSubmit={submit}>
      <input className="input big" placeholder="ماذا نحتاج؟" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus={!need} />
      
      <Field label="الكمية / التفاصيل (اختياري)">
        <input className="input" placeholder="مثال: حبتين، 2 كيلو، ماركة معينة..." value={qty} onChange={(e) => setQty(e.target.value)} />
      </Field>

      <Field label="التصنيف">
        <div className="chips-wrap">
          {NEED_CATEGORIES.map((c) => (
            <button type="button" key={c.key} className={`chip${category === c.key ? ' on' : ''}`} onClick={() => setCategory(c.key)}>
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
      </Field>

      {partner && (
        <Field label="من سيشتريها؟">
          <div className="chips-wrap">
            <button type="button" className={`chip${buyer === null ? ' on' : ''}`} onClick={() => setBuyer(null)}>
              غير محدد
            </button>
            {[me, partner].map((m) => (
              <button type="button" key={m.id} className={`chip${buyer === m.id ? ' on' : ''}`} onClick={() => setBuyer(m.id)}>
                <Avatar m={m} size="xs" /> {m.id === me.id ? 'أنا' : m.name}
              </button>
            ))}
          </div>
        </Field>
      )}

      {need && (
        <Field label="الحالة">
          <Seg<NeedStatus> value={status} onChange={setStatus} options={NEED_STATUSES.map((s) => ({ key: s.key as NeedStatus, label: s.label }))} />
        </Field>
      )}

      <div className="toggle-row" style={{ marginTop: 8 }}>
        <div>
          <b style={{ fontSize: 14.5 }}>أحتاجه ضروري اليوم 🚨</b>
          <div className="muted" style={{ fontSize: 12 }}>سيصل تنبيه فوري للطرف الآخر</div>
        </div>
        <Switch on={urgent} onChange={setUrgent} />
      </div>

      <div className="form-actions" style={{ marginTop: 12 }}>
        {need && <button type="button" className="btn btn-soft-danger" style={{ flex: 'none', width: 52, padding: 0 }} onClick={remove} aria-label="حذف"><Trash2 size={20} /></button>}
        <button className="btn btn-primary" disabled={!title.trim()}>{need ? 'حفظ' : 'إضافة للقائمة'}</button>
      </div>
    </form>
  );
}
