import { Map } from 'lucide-react';
import { useData } from '@/state/DataProvider';
import { useUI } from '@/state/UIProvider';
import { Card, Empty } from '@/components/ui';
import { PlanForm } from './PlanForm';
import type { Plan } from '@/data/types';

export function PlansCard() {
  const { plans, actions } = useData();
  const ui = useUI();
  
  const items = (plans || []).filter((p) => !p.doneAt).slice(0, 5);

  const openPlan = (p: Plan) => ui.open((c) => <PlanForm plan={p} onDone={c} />, { title: 'تعديل الخطة' });

  return (
    <Card 
      icon={<Map />} tint="var(--teal-soft)" title="خطط مستقبلية" sub="أشياء نود القيام بها لاحقاً"
      actions={<button className="link-btn" onClick={() => ui.open((c) => <PlanForm onDone={c} />, { title: 'إضافة خطة' })}>إضافة</button>}
    >
      <div className="list" style={{ marginTop: 8 }}>
        {items.map((p) => (
          <div key={p.id} className="row tap" onClick={() => openPlan(p)}>
            <button
              className={`check${p.doneAt ? ' on' : ''} square`}
              onClick={(e) => { e.stopPropagation(); actions.setPlanDone(p, !p.doneAt); }}
              aria-label="إنجاز الخطة"
            />
            <div className="row-main">
              <div className="row-title">{p.title}</div>
              {p.notes && <div className="row-meta">{p.notes}</div>}
            </div>
          </div>
        ))}
        {items.length === 0 && <Empty emoji="💭" text="لا توجد خطط مستقبلية" />}
      </div>
    </Card>
  );
}
