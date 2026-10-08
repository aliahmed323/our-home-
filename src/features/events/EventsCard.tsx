import { CalendarDays, MapPin } from 'lucide-react';
import { useData } from '@/state/DataProvider';
import { useUI } from '@/state/UIProvider';
import { Card, Empty } from '@/components/ui';
import { EventForm } from './EventForm';
import { todayISO, dueLabel, fmt, parseISO, daysBetween } from '@/lib/dates';
import type { CalEvent } from '@/data/types';

export function EventsCard() {
  const { events } = useData();
  const ui = useUI();
  
  const today = todayISO();
  const upcoming = events.filter((e) => e.date >= today).slice(0, 4);

  const openEvent = (e: CalEvent) => ui.open((c) => <EventForm event={e} onDone={c} />, { title: 'تعديل الموعد' });

  // Generate a mini 7-day week view starting from today
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = parseISO(today);
    d.setDate(d.getDate() + i);
    const iso = todayISO(d);
    const dayEvents = events.filter((e) => e.date === iso);
    return {
      iso,
      dayNum: d.getDate(),
      dayName: fmt(d, { weekday: 'narrow' }),
      isToday: i === 0,
      events: dayEvents,
    };
  });

  return (
    <Card 
      icon={<CalendarDays />} tint="var(--amber-soft)" title="المواعيد والاجتماعات" 
      actions={<button className="link-btn" onClick={() => ui.open((c) => <EventForm onDone={c} />)}>إضافة</button>}
    >
      <div className="week">
        {week.map((d) => (
          <div key={d.iso} className={`day${d.isToday ? ' today' : ''}`}>
            <small>{d.dayName}</small>
            <b className="num">{d.dayNum}</b>
            <div className="dots">
              {d.events.slice(0, 3).map((_, i) => <i key={i} />)}
            </div>
          </div>
        ))}
      </div>

      <div className="list">
        {upcoming.map((e) => {
          const due = dueLabel(e.date);
          const diff = daysBetween(new Date(), parseISO(e.date));
          const isSoon = diff <= 2;
          
          return (
            <div key={e.id} className="row tap" onClick={() => openEvent(e)}>
              <div className="ev-emoji">{e.emoji || '📅'}</div>
              <div className="row-main">
                <div className="row-title">{e.title}</div>
                <div className="row-meta">
                  <span className={`pill ${isSoon ? due.tone : ''}`}>{due.text}</span>
                  {e.notes && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}><MapPin size={10} /> ملاحظة</span>}
                </div>
              </div>
              {e.time && <div className="ev-time num">{e.time}</div>}
            </div>
          );
        })}
        {upcoming.length === 0 && <Empty emoji="📅" text="لا توجد مواعيد قادمة" />}
      </div>
    </Card>
  );
}
