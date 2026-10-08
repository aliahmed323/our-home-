import { useEffect, useState } from 'react';
import { useData } from '@/state/DataProvider';
import { auth } from '@/services/session';
import { enablePush, permission } from '@/services/notifications';
import { LogOut, Bell, BellOff, Settings as SettingsIcon } from 'lucide-react';
import { Sheet } from '@/components/Sheet';

export function Topbar() {
  const { me, household } = useData();
  const [open, setOpen] = useState(false);
  const [pushState, setPush] = useState(permission());

  useEffect(() => {
    // Poll permission state in case user changes it in browser settings
    const timer = setInterval(() => setPush(permission()), 2000);
    return () => clearInterval(timer);
  }, []);

  const handlePush = async () => {
    if (pushState === 'granted') {
      alert('الإشعارات مفعلة مسبقاً. لإيقافها، يرجى تغيير إعدادات المتصفح.');
    } else {
      const p = await enablePush(useData().store, me.id);
      setPush(p);
    }
  };

  return (
    <>
      <header className="topbar">
        <div className="hello">
          <small>مرحباً {me.name} 👋</small>
          <h1>بيتنا <span>Our Home</span></h1>
        </div>
        <button className="icon-btn solid" onClick={() => setOpen(true)} aria-label="الإعدادات">
          <SettingsIcon size={20} />
        </button>
      </header>

      {open && (
        <Sheet title="الإعدادات" onClose={() => setOpen(false)}>
          <div className="set-title">البيت</div>
          <div className="set-group">
            <div className="set-row">
              <div className="ic">🏠</div>
              <div className="t">
                {household?.name}
                <small>كود الدعوة: <b className="ltr" style={{ fontSize: 13 }}>{household?.id}</b></small>
              </div>
            </div>
            <div className="set-row">
              <div className="ic">💰</div>
              <div className="t">
                العملة
                <small>{household?.currency}</small>
              </div>
            </div>
          </div>

          <div className="set-title">الإشعارات</div>
          <div className="set-group">
            <button className="set-row" onClick={handlePush}>
              <div className="ic" style={{ color: pushState === 'granted' ? 'var(--brand)' : 'inherit' }}>
                {pushState === 'granted' ? <Bell size={18} /> : <BellOff size={18} />}
              </div>
              <div className="t">
                إشعارات التنبيهات والنشاط
                <small>{pushState === 'granted' ? 'مفعلة' : pushState === 'denied' ? 'محظورة من المتصفح' : 'اضغط للتفعيل'}</small>
              </div>
            </button>
          </div>

          <div className="set-title">الحساب</div>
          <div className="set-group">
            <button className="set-row" onClick={() => auth.signOut()} style={{ color: 'var(--red)' }}>
              <div className="ic"><LogOut size={18} /></div>
              <div className="t">تسجيل الخروج</div>
            </button>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: 'var(--text-3)' }}>
            v0.1.0
          </div>
        </Sheet>
      )}
    </>
  );
}
