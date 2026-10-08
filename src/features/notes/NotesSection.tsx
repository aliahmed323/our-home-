import { StickyNote } from 'lucide-react';
import { useData } from '@/state/DataProvider';
import { useUI } from '@/state/UIProvider';
import { NoteForm } from './NoteForm';

export function NotesSection() {
  const { notes, me, partner } = useData();
  const ui = useUI();
  
  if (notes.length === 0) return null;

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ padding: '0 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 17 }}>
          <StickyNote size={20} color="var(--teal)" /> ملاحظات
        </div>
        <button className="link-btn" onClick={() => ui.open((c) => <NoteForm onDone={c} />)}>إضافة</button>
      </div>
      <div className="notes" style={{ padding: '0 16px' }}>
        {notes.map((n) => {
          const author = n.createdBy === me.id ? 'أنا' : partner?.name || 'شريكك';
          return (
            <div key={n.id} className="note tap" style={{ background: n.color }} onClick={() => ui.open((c) => <NoteForm note={n} onDone={c} />, { title: 'تعديل الملاحظة' })}>
              {n.text}
              <div className="n-foot">بقلم {author}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
