import { useState, type FormEvent } from 'react';
import { Home, Sparkles, UserPlus, ArrowRight, Loader2 } from 'lucide-react';
import { useSession } from '@/state/SessionProvider';
import { auth, createHousehold, joinHousehold } from '@/services/session';
import { Field } from '@/components/ui';

export function Onboarding() {
  const session = useSession();
  const user = session.phase !== 'signedOut' && session.phase !== 'loading' ? session.user : null;
  
  const [mode, setMode] = useState<'pick' | 'create' | 'join'>('pick');
  
  // Create state
  const [houseName, setHouseName] = useState('بيتنا');
  const [currency, setCurrency] = useState('ريال');
  
  // Join state
  const [code, setCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login view
  if (!user) {
    return (
      <div className="onboard">
        <div className="ob-hero">
          <Home size={64} color="var(--brand)" strokeWidth={1.5} style={{ margin: '0 auto 20px' }} />
          <h1>بيتنا</h1>
          <p>لوحة التحكم المشتركة لك ولشريكك.<br/>مهام، مشتريات، مواعيد ومصروفات في مكان واحد.</p>
        </div>
        
        <div className="ob-actions">
          <button className="btn btn-primary lg" onClick={() => auth.signInGoogle()}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width={20} alt="G" style={{ background: '#fff', borderRadius: '50%', padding: 2 }} />
            الدخول باستخدام حساب جوجل
          </button>
          
          <div style={{ textAlign: 'center', margin: '16px 0', color: 'var(--text-3)', fontSize: 13 }}>أو باستخدام البريد الإلكتروني</div>
          
          <form className="form" onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const em = fd.get('email') as string;
            const pw = fd.get('password') as string;
            if (!em || !pw) return;
            setError(''); setLoading(true);
            try {
              await auth.signInEmail(em, pw);
            } catch (err: any) {
              if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                try {
                  await auth.signUpEmail(em, pw, em.split('@')[0]);
                } catch (e2: any) {
                  setError('فشل في تسجيل الدخول أو إنشاء الحساب: ' + e2.message);
                }
              } else {
                setError('فشل في تسجيل الدخول: ' + err.message);
              }
            }
            setLoading(false);
          }}>
            <input name="email" type="email" className="input big" placeholder="البريد الإلكتروني" required dir="ltr" />
            <input name="password" type="password" className="input big" placeholder="كلمة المرور" required dir="ltr" />
            {error && <div style={{ color: 'var(--red)', fontSize: 13 }}>{error}</div>}
            <button className="btn btn-soft lg" type="submit" disabled={loading}>
              {loading ? 'جاري التحميل...' : 'دخول / إنشاء حساب'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!houseName.trim() || !currency.trim()) return;
    setLoading(true); setError('');
    try {
      await createHousehold(user.uid, { name: user.displayName || 'أنا', emoji: '🧑', color: '#6D5BFF' });
    } catch (err) {
      setError('حدث خطأ. حاول مرة أخرى.');
      setLoading(false);
    }
  };

  const handleJoin = async (e: FormEvent) => {
    e.preventDefault();
    if (code.trim().length < 6) return;
    setLoading(true); setError('');
    try {
      await joinHousehold(user!.uid, code.trim().toUpperCase(), { name: user!.displayName || 'شريكك', emoji: '🧑', color: '#F0567A' });
    } catch (err: any) {
      setError(err.message === 'not-found' ? 'الكود غير صحيح' : 'حدث خطأ. حاول مرة أخرى.');
      setLoading(false);
    }
  };

  if (mode === 'pick') {
    return (
      <div className="onboard">
        <div className="ob-hero" style={{ textAlign: 'right' }}>
          <h2>مرحباً بك {user.displayName?.split(' ')[0]} 👋</h2>
          <p>أنت الآن مسجل الدخول. الخطوة التالية هي إعداد "البيت".</p>
        </div>
        
        <div className="ob-actions">
          <div className="card tap" style={{ background: 'var(--brand-soft)' }} onClick={() => setMode('create')}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8, color: 'var(--brand)' }}>
              <Sparkles size={24} /> <span style={{ fontWeight: 700, fontSize: 18 }}>إنشاء بيت جديد</span>
            </div>
            <div className="muted" style={{ fontSize: 14 }}>أنا أول من يستخدم التطبيق، سأقوم بإنشاء البيت وسأدعو شريكي لاحقاً.</div>
          </div>
          
          <div className="card tap" style={{ background: 'var(--violet-soft)' }} onClick={() => setMode('join')}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8, color: 'var(--violet)' }}>
              <UserPlus size={24} /> <span style={{ fontWeight: 700, fontSize: 18 }}>الانضمام لبيت موجود</span>
            </div>
            <div className="muted" style={{ fontSize: 14 }}>شريكي قام بإنشاء البيت مسبقاً وأعطاني كود الدعوة المكون من 6 حروف.</div>
          </div>
        </div>
        
        <button className="link-btn" style={{ margin: '30px auto', display: 'block', color: 'var(--red)' }} onClick={() => auth.signOut()}>تسجيل الخروج</button>
      </div>
    );
  }

  if (mode === 'create') {
    return (
      <div className="onboard">
        <button className="link-btn" onClick={() => setMode('pick')} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 20 }}>
          <ArrowRight size={16} /> رجوع
        </button>
        <div className="ob-hero" style={{ textAlign: 'right' }}>
          <h2>إنشاء بيت جديد</h2>
          <p>قم بتسمية بيتكم واختر العملة لتبدأ.</p>
        </div>
        
        <form className="form" onSubmit={handleCreate}>
          <Field label="اسم البيت">
            <input className="input big" value={houseName} onChange={e => setHouseName(e.target.value)} required />
          </Field>
          <Field label="العملة">
            <input className="input big" value={currency} onChange={e => setCurrency(e.target.value)} placeholder="مثال: ريال، دينار، درهم..." required />
          </Field>
          
          {error && <div style={{ color: 'var(--red)', fontSize: 14 }}>{error}</div>}
          
          <button className="btn btn-primary lg" style={{ marginTop: 20 }} disabled={loading}>
            {loading ? <Loader2 className="spin" size={20} /> : 'إنشاء وتوليد كود الدعوة'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="onboard">
      <button className="link-btn" onClick={() => setMode('pick')} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 20 }}>
        <ArrowRight size={16} /> رجوع
      </button>
      <div className="ob-hero" style={{ textAlign: 'right' }}>
        <h2>الانضمام للبيت</h2>
        <p>اطلب من شريكك إعطائك كود الدعوة المكون من 6 أحرف والموجود في إعدادات التطبيق لديه.</p>
      </div>
      
      <form className="form" onSubmit={handleJoin}>
        <Field label="كود الدعوة">
          <input className="input big ltr" placeholder="XXXXXX" value={code} onChange={e => setCode(e.target.value.toUpperCase())} maxLength={6} required style={{ textAlign: 'center', letterSpacing: 10, fontSize: 24 }} autoFocus />
        </Field>
        
        {error && <div style={{ color: 'var(--red)', fontSize: 14 }}>{error}</div>}
        
        <button className="btn btn-primary lg" style={{ marginTop: 20 }} disabled={loading || code.length < 6}>
          {loading ? <Loader2 className="spin" size={20} /> : 'انضمام للبيت'}
        </button>
      </form>
    </div>
  );
}
