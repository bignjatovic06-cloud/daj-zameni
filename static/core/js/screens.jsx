const { useState: useS, useEffect: useE, useRef: useR } = React;

/* ─── CITY LIST ──────────────────────────────────── */
const CITIES = ['Ada','Aleksandrovac','Aleksinac','Alibunar','Apatin','Aranđelovac','Arilje','Bajina Bašta','Batočina','Bač','Bačka Palanka','Bačka Topola','Bela Palanka','Bela Crkva','Beograd','Beočin','Bečej','Blace','Bogatić','Bojnik','Boljevac','Bor','Bosilegrad','Brus','Bujanovac','Valjevo','Varvarin','Velika Plana','Veliko Gradište','Vladimirci','Vladičin Han','Vlasotince','Vranje','Vrbas','Vrnjačka Banja','Vršac','Gadžin Han','Golubac','Gornji Milanovac','Despotovac','Dimitrovgrad','Doljevac','Žabalj','Žabari','Žagubica','Žitište','Zaječar','Zrenjanin','Ivanjica','Inđija','Irig','Jagodina','Kanjiža','Kikinda','Kladovo','Knić','Knjaževac','Kovin','Koceljeva','Kosjerić','Kovačica','Kragujevac','Kraljevo','Kruševac','Kučevo','Kuršumlija','Lazarevac','Lapovo','Lebane','Leskovac','Ljig','Ljubovija','Majdanpek','Mali Zvornik','Mali Iđoš','Merošina','Mionica','Mladenovac','Negotin','Niš','Nova Crnja','Nova Varoš','Novi Bečej','Novi Kneževac','Novi Pazar','Novi Sad','Odžaci','Opovo','Pančevo','Paraćin','Petrovac na Mlavi','Pećinci','Pirot','Plandište','Požarevac','Požega','Predejane','Preševo','Priboj','Prijepolje','Prokuplje','Rača','Raška','Rekovac','Ruma','Senta','Sečanj','Sjenica','Smederevo','Smederevska Palanka','Sokobanja','Sombor','Srbobran','Sremska Mitrovica','Sremski Karlovci','Stara Pazova','Subotica','Surdulica','Svrljig','Temerin','Titel','Topola','Trgovište','Trstenik','Tutin','Ub','Užice','Ćićevac','Ćuprija','Čajetina','Čačak','Čoka','Šabac','Šid'];

/* ─── CITY PICKER ────────────────────────────────── */
function CityPicker({ value, onChange, className, inputStyle }) {
  var [q, setQ]         = useS('');
  var [open, setOpen]   = useS(false);
  var wrapRef           = useR(null);

  useE(function() {
    if (!open) return;
    function handler(e) { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handler);
    return function() { document.removeEventListener('mousedown', handler); };
  }, [open]);

  var ql      = q.toLowerCase();
  var matches = ql ? CITIES.filter(function(c) { return c.toLowerCase().includes(ql); }) : CITIES;

  function select(city) {
    onChange(city);
    setQ('');
    setOpen(false);
  }

  return (
    React.createElement('div', { ref: wrapRef, style: { position: 'relative' } },
      React.createElement('div', {
        style: { display: 'flex', alignItems: 'center', gap: 0, position: 'relative' },
      },
        React.createElement('input', {
          className: className || 'input',
          style: Object.assign({ width: '100%', boxSizing: 'border-box', paddingRight: 28 }, inputStyle || {}),
          value: open ? q : (value || ''),
          placeholder: value || 'Izaberi grad...',
          onFocus: function() { setOpen(true); setQ(''); },
          onChange: function(e) { setQ(e.target.value); if (!open) setOpen(true); },
          autoComplete: 'off',
        }),
        React.createElement('span', {
          style: { position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--ink-3)', fontSize: 11 },
        }, open ? '▲' : '▼')
      ),
      open && React.createElement('div', {
        style: {
          position: 'absolute', zIndex: 999, top: 'calc(100% + 4px)', left: 0, right: 0,
          background: '#fff', border: '1px solid var(--line)', borderRadius: 10,
          boxShadow: '0 4px 20px rgba(0,0,0,.12)', maxHeight: 220, overflowY: 'auto',
        },
      },
        matches.length === 0
          ? React.createElement('div', { style: { padding: '10px 14px', fontSize: 13, color: 'var(--ink-3)' } }, 'Nema rezultata')
          : matches.map(function(city) {
              return React.createElement('div', {
                key: city,
                onMouseDown: function(e) { e.preventDefault(); select(city); },
                style: {
                  padding: '8px 14px', fontSize: 14, cursor: 'pointer',
                  background: city === value ? 'var(--accent-soft)' : 'transparent',
                  fontWeight: city === value ? 600 : 400,
                  color: 'var(--ink)',
                },
                onMouseEnter: function(e) { e.currentTarget.style.background = 'var(--hover)'; },
                onMouseLeave: function(e) { e.currentTarget.style.background = city === value ? 'var(--accent-soft)' : 'transparent'; },
              }, city);
            })
      )
    )
  );
}

/* ─── CATEGORY PICKER MODAL ────────────────────── */
function CategoryPickerModal({ categories, selected, onSelect, onClose }) {
  var [q, setQ]               = useS('');
  var [activeCat, setActiveCat] = useS(null);
  var [drillCat, setDrillCat] = useS(null);
  var inputRef                = useR(null);
  var isMobile                = window.innerWidth < 640;

  var displayCats = categories.filter(function(c) { return c.id !== 'sve'; });

  useE(function() {
    if (inputRef.current) inputRef.current.focus();
    if (!isMobile && displayCats.length > 0) setActiveCat(displayCats[0]);
  }, []);

  var ql = q.toLowerCase();
  var searchResults = [];
  if (q) {
    displayCats.forEach(function(cat) {
      if (cat.name.toLowerCase().includes(ql)) {
        searchResults.push({ type: 'cat', id: cat.id, name: cat.name, count: cat.count, parentName: null });
      }
      (cat.children || []).forEach(function(sub) {
        if (sub.name.toLowerCase().includes(ql)) {
          searchResults.push({ type: 'sub', id: sub.id, name: sub.name, count: sub.count, parentName: cat.name });
        }
      });
    });
  }

  var handleKey = function(e) {
    if (e.key === 'Escape') {
      if (isMobile && drillCat) { setDrillCat(null); return; }
      onClose();
    }
  };

  var overlayStyle = isMobile
    ? { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 1000 }
    : { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 1000, display: 'grid', placeItems: 'center', padding: 24 };

  var panelStyle = isMobile
    ? { background: '#fff', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }
    : { background: '#fff', borderRadius: 16, width: '100%', maxWidth: 900, maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,.2)', overflow: 'hidden' };

  return (
    <div style={overlayStyle} onClick={isMobile ? undefined : onClose} onKeyDown={handleKey}>
      <div style={panelStyle} onClick={function(e) { e.stopPropagation(); }}>

        {/* Header */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12 }}>
          {isMobile && drillCat ? (
            <button onClick={function() { setDrillCat(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', display: 'grid', placeItems: 'center', padding: 4 }}>
              <Icon name="arrow-l" size={20}/>
            </button>
          ) : (
            <Icon name="search" size={18} style={{ color: 'var(--ink-3)', flexShrink: 0 }}/>
          )}
          {isMobile && drillCat ? (
            <span style={{ flex: 1, fontWeight: 700, fontSize: 16, color: 'var(--ink)' }}>{drillCat.name}</span>
          ) : (
            <input
              ref={inputRef}
              value={q}
              onChange={function(e) { setQ(e.target.value); if (isMobile) setDrillCat(null); }}
              placeholder="Pretraži kategorije i podkategorije..."
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, color: 'var(--ink)', background: 'transparent' }}
            />
          )}
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', display: 'grid', placeItems: 'center', padding: 4 }}>
            <Icon name="x" size={20}/>
          </button>
        </div>

        {/* Search results */}
        {q ? (
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
            {searchResults.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--ink-3)', fontSize: 14 }}>
                Nema rezultata za „{q}"
              </div>
            ) : searchResults.map(function(r) {
              var isSel = selected === r.id;
              return (
                <div
                  key={r.type + r.id}
                  onClick={function() { onSelect(r.id); }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, cursor: 'pointer', background: isSel ? 'var(--accent-soft)' : 'transparent' }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: isSel ? 'var(--accent)' : 'var(--ink)' }}>{r.name}</div>
                    {r.parentName && <div style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>{r.parentName}</div>}
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>{r.count || 0}</span>
                </div>
              );
            })}
          </div>

        /* Mobile drill-down view */
        ) : isMobile ? (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {drillCat ? (
              <>
                <div
                  onClick={function() { onSelect(drillCat.id); }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--line)', cursor: 'pointer' }}
                >
                  <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--accent)' }}>Sve u kategoriji {drillCat.name}</span>
                  <Icon name="arrow-r" size={14} style={{ color: 'var(--accent)' }}/>
                </div>
                {(!drillCat.children || drillCat.children.length === 0) ? (
                  <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--ink-3)', fontSize: 14 }}>Nema podkategorija.</div>
                ) : drillCat.children.map(function(sub) {
                  var isSel = selected === sub.id;
                  return (
                    <div
                      key={sub.id}
                      onClick={function() { onSelect(sub.id); }}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px', borderBottom: '1px solid var(--line)', cursor: 'pointer', background: isSel ? 'var(--accent-soft)' : 'transparent' }}
                    >
                      <span style={{ fontSize: 15, color: isSel ? 'var(--accent)' : 'var(--ink)', fontWeight: isSel ? 600 : 400 }}>{sub.name}</span>
                      <span style={{ fontSize: 13, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>{sub.count || 0}</span>
                    </div>
                  );
                })}
              </>
            ) : displayCats.map(function(cat) {
              var hasChildren = cat.children && cat.children.length > 0;
              return (
                <div
                  key={cat.id}
                  onClick={function() { hasChildren ? setDrillCat(cat) : onSelect(cat.id); }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px', borderBottom: '1px solid var(--line)', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Icon name={cat.icon || 'tag'} size={20} stroke={1.5} style={{ color: 'var(--accent)', flexShrink: 0 }}/>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>{cat.name}</div>
                      {hasChildren && <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 1 }}>{cat.children.length} podkategorija</div>}
                    </div>
                  </div>
                  <Icon name={hasChildren ? 'arrow-r' : 'check'} size={16} style={{ color: selected === cat.id ? 'var(--accent)' : 'var(--ink-3)', flexShrink: 0 }}/>
                </div>
              );
            })}
          </div>

        /* Desktop two-column view */
        ) : (
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '220px 1fr', overflow: 'hidden' }}>
            <div style={{ borderRight: '1px solid var(--line)', overflowY: 'auto' }}>
              {displayCats.map(function(cat) {
                var isAct = activeCat && activeCat.id === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={function() { setActiveCat(cat); }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '11px 16px', cursor: 'pointer',
                      background: isAct ? 'var(--accent-soft)' : 'transparent',
                      color: isAct ? 'var(--accent)' : 'var(--ink)',
                      fontWeight: isAct ? 700 : 500, fontSize: 14,
                      borderLeft: isAct ? '3px solid var(--accent)' : '3px solid transparent',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Icon name={cat.icon || 'tag'} size={16} stroke={1.5}/>
                      <span>{cat.name}</span>
                    </div>
                    <Icon name="arrow-r" size={12} style={{ color: 'var(--ink-3)' }}/>
                  </div>
                );
              })}
            </div>

            <div style={{ overflowY: 'auto', padding: '18px 20px' }}>
              {activeCat ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 700 }}>{activeCat.name}</h3>
                    <button
                      onClick={function() { onSelect(activeCat.id); }}
                      style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      Vidi sve u kategoriji <Icon name="arrow-r" size={13}/>
                    </button>
                  </div>
                  {(!activeCat.children || activeCat.children.length === 0) ? (
                    <div style={{ fontSize: 13, color: 'var(--ink-3)', padding: '20px 0' }}>Nema podkategorija.</div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      {activeCat.children.map(function(sub) {
                        var isSel = selected === sub.id;
                        return (
                          <div
                            key={sub.id}
                            onClick={function() { onSelect(sub.id); }}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 8, cursor: 'pointer', background: isSel ? 'var(--accent-soft)' : 'transparent' }}
                          >
                            <span style={{ fontSize: 14, color: isSel ? 'var(--accent)' : 'var(--ink)', fontWeight: isSel ? 600 : 400 }}>
                              {sub.name}
                            </span>
                            <span style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', marginLeft: 8, flexShrink: 0 }}>
                              {sub.count || 0}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--ink-3)', fontSize: 14 }}>Izaberi kategoriju</div>
              )}
            </div>
          </div>
        )}

        {!isMobile && (
          <div style={{ padding: '10px 20px', borderTop: '1px solid var(--line)', background: '#faf8f1', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
              ⚡ Brzi tip: kucaj naziv predmeta i predložićemo kategoriju
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
              <span style={{ background: 'var(--line)', padding: '2px 7px', borderRadius: 4, marginRight: 4 }}>Esc</span>
              za izlaz
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── LOGIN MODAL ──────────────────────────────── */
function LoginModal({ onClose, onSuccess, onSwitchToRegister }) {
  const [username, setUsername] = useS('');
  const [password, setPassword] = useS('');
  const [error, setError]       = useS('');
  const [loading, setLoading]   = useS(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await apiLogin(username, password);
    setLoading(false);
    if (res.ok) { onSuccess(res.user); onClose(); }
    else setError(res.error || 'Greška pri prijavi.');
  };

  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
        <div className="mh">
          <h3>Prijava</h3>
          <button className="x-btn" onClick={onClose}><Icon name="x" size={16}/></button>
        </div>
        <form className="mb" onSubmit={submit}>
          {error && (
            <div style={{ padding: '10px 14px', background: '#fff0ee', border: '1px solid #fdc5bc', borderRadius: 8, fontSize: 13, color: 'var(--warn)', marginBottom: 14 }}>
              {error}
            </div>
          )}

          <a
            href="/social/login/google-oauth2/"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              width: '100%', padding: '10px 16px', borderRadius: 10,
              border: '1.5px solid var(--line)', background: '#fff',
              color: 'var(--ink)', fontSize: 14, fontWeight: 600,
              textDecoration: 'none', cursor: 'pointer', marginBottom: 16,
              boxSizing: 'border-box',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            Nastavi sa Google
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }}/>
            <span style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>ili</span>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }}/>
          </div>

          <div className="field-group">
            <label>Korisničko ime</label>
            <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="npr. marko_bg" autoFocus/>
          </div>
          <div className="field-group">
            <label>Lozinka</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"/>
          </div>
          <button className="nav-btn primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', height: 42, fontSize: 15, marginTop: 6 }}>
            {loading ? 'Prijavljujem…' : 'Prijavi se'}
          </button>
          <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-3)', marginTop: 14 }}>
            Nemaš nalog?{' '}
            <span style={{ color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }} onClick={onSwitchToRegister}>
              Registruj se
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── REGISTER MODAL ──────────────────────────────── */
function RegisterModal({ onClose, onSuccess, onSwitchToLogin }) {
  const [username, setUsername] = useS('');
  const [email, setEmail]       = useS('');
  const [password, setPassword] = useS('');
  const [error, setError]       = useS('');
  const [loading, setLoading]   = useS(false);
  const [pending, setPending]   = useS(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Lozinka mora imati najmanje 8 karaktera.'); return; }
    setLoading(true);
    const res = await apiRegister(username, email, password);
    setLoading(false);
    if (res.ok && res.pending_verification) {
      setPending(true);
      return;
    }
    if (res.ok) { onSuccess(res.user); onClose(); return; }
    // Surface the first specific field error if backend returned one
    const firstFieldErr = (res.username && res.username[0]) || (res.password && res.password[0]) || (res.email && res.email[0]);
    setError(firstFieldErr || res.error || 'Greška pri registraciji.');
  };

  if (pending) {
    return (
      <div className="scrim" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
          <div className="mh">
            <h3>Proveri inbox</h3>
            <button className="x-btn" onClick={onClose}><Icon name="x" size={16}/></button>
          </div>
          <div className="mb" style={{ textAlign: 'center', padding: '24px 8px' }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>📬</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 10, color: 'var(--ink)' }}>
              Poslat ti je verifikacioni email.
            </div>
            <div style={{ fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.55, marginBottom: 22 }}>
              Klikni na link u poruci da aktiviraš nalog i da te ulogujemo.
              Ako ne vidiš email u inbox-u, proveri spam.
            </div>
            <button className="nav-btn primary" onClick={onClose} style={{ width: '100%', justifyContent: 'center', height: 42, fontSize: 15 }}>
              U redu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
        <div className="mh">
          <h3>Registracija</h3>
          <button className="x-btn" onClick={onClose}><Icon name="x" size={16}/></button>
        </div>
        <form className="mb" onSubmit={submit}>
          {error && (
            <div style={{ padding: '10px 14px', background: '#fff0ee', border: '1px solid #fdc5bc', borderRadius: 8, fontSize: 13, color: 'var(--warn)', marginBottom: 14 }}>
              {error}
            </div>
          )}

          <a
            href="/social/login/google-oauth2/"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              width: '100%', padding: '10px 16px', borderRadius: 10,
              border: '1.5px solid var(--line)', background: '#fff',
              color: 'var(--ink)', fontSize: 14, fontWeight: 600,
              textDecoration: 'none', cursor: 'pointer', marginBottom: 16,
              boxSizing: 'border-box',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            Registruj se sa Google
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }}/>
            <span style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>ili kreiraj nalog</span>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }}/>
          </div>

          <div className="field-group">
            <label>Korisničko ime</label>
            <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="npr. marko_bg" autoFocus/>
            <div className="hint">Bez razmaka, koristiće se javno.</div>
          </div>
          <div className="field-group">
            <label>Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="marko@email.com"/>
          </div>
          <div className="field-group">
            <label>Lozinka</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="najmanje 8 karaktera"/>
          </div>
          <button className="nav-btn primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', height: 42, fontSize: 15, marginTop: 6 }}>
            {loading ? 'Registrujem…' : 'Kreiraj nalog'}
          </button>
          <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-3)', marginTop: 14 }}>
            Već imaš nalog?{' '}
            <span style={{ color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }} onClick={onSwitchToLogin}>
              Prijavi se
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── OFFER MODAL ──────────────────────────────── */
function OfferModal({ item, onClose, onSuccess }) {
  const [myListings, setMyListings] = useS(null);
  const [selected, setSelected]     = useS(null);
  const [cash, setCash]             = useS('');
  const [msg, setMsg]               = useS('');
  const [loading, setLoading]       = useS(false);
  const [err, setErr]               = useS('');

  useE(() => {
    apiMyListings().then(res => {
      if (Array.isArray(res.results)) setMyListings(res.results);
      else setMyListings([]);
    });
  }, []);

  const cashNum = parseFloat(cash.replace(/\./g, '').replace(',', '.')) || null;
  const isBarter = item.type === 'barter';
  const noListings = myListings !== null && myListings.length === 0;

  const submit = async () => {
    setLoading(true);
    setErr('');
    const offerCash = noListings ? (item.price || null) : cashNum;
    const res = await apiCreateOffer(item.id, selected ? selected.id : null, msg, offerCash);
    setLoading(false);
    if (res.ok) { onSuccess(); }
    else if (res.error === 'already_offered') setErr('Već si poslao/la ponudu za ovaj oglas.');
    else if (res.error === 'barter_only') setErr('Korisnik ne želi otkup, samo razmenu.');
    else setErr(res.error || 'Greška pri slanju ponude.');
  };

  const condLabel = { new: 'Novo', like_new: 'Polovno — kao novo', good: 'Polovno — odlično', fair: 'Polovno — vrlo dobro', poor: 'Polovno — dobro', antique: 'Antikvitet' };

  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div className="mh">
          <h3>Predloži razmenu</h3>
          <button className="x-btn" onClick={onClose}><Icon name="x" size={16}/></button>
        </div>
        <div className="mb">
          <p style={{ color: 'var(--ink-3)', fontSize: 13, marginBottom: 16 }}>
            Nudite u zamenu za: <b style={{ color: 'var(--ink)' }}>{item.title}</b>
          </p>

          {myListings === null ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--ink-3)', fontSize: 13 }}>Učitavam tvoje oglase…</div>
          ) : noListings && isBarter ? (
            <div style={{ padding: '20px 16px', background: '#fff8ee', border: '1px solid #f6d860', borderRadius: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>🔄</div>
              <p style={{ fontWeight: 600, marginBottom: 6 }}>Korisnik ne želi otkup, samo razmenu</p>
              <p style={{ fontSize: 13, color: 'var(--ink-3)' }}>
                Da bi predložio/la razmenu, postavi oglas i ponudi ga u zamenu.
              </p>
            </div>
          ) : noListings ? (
            <>
              <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 16 }}>
                Nemaš aktivnih oglasa. Možeš poslati ponudu za otkup po ceni oglasa:
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--accent-soft)', border: '1.5px solid var(--accent)', borderRadius: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 14, color: 'var(--ink-2)' }}>Cena oglasa</span>
                <b style={{ fontSize: 20, color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>
                  {item.price ? Number(item.price).toLocaleString('sr-RS') + ' RSD' : 'Nije navedena'}
                </b>
              </div>
              <div className="field-group">
                <label>Poruka <span style={{ fontWeight: 400, color: 'var(--ink-3)' }}>(opciono)</span></label>
                <textarea className="textarea" value={msg} onChange={e => setMsg(e.target.value)} placeholder="Dodaj napomenu…" rows={2}/>
              </div>
              {err && <div style={{ padding: '10px 14px', background: '#fff0ee', border: '1px solid #fdc5bc', borderRadius: 8, fontSize: 13, color: 'var(--warn)', marginTop: 8 }}>{err}</div>}
            </>
          ) : (
            <>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', letterSpacing: '.06em', marginBottom: 10 }}>
                IZABERI KOJI OGLAS NUDIŠ
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280, overflowY: 'auto', marginBottom: 16 }}>
                {myListings.map(l => {
                  const isSelected = selected?.id === l.id;
                  return (
                    <div
                      key={l.id}
                      onClick={() => setSelected(l)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                        border: isSelected ? '2px solid var(--accent)' : '1.5px solid var(--line)',
                        background: isSelected ? 'var(--accent-soft)' : '#fff',
                        transition: 'all .15s',
                      }}
                    >
                      <div style={{
                        width: 48, height: 48, borderRadius: 8, flexShrink: 0,
                        background: '#f0ede4', overflow: 'hidden',
                        display: 'grid', placeItems: 'center',
                      }}>
                        {l.image
                          ? <img src={l.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                          : <span style={{ fontSize: 20 }}>📦</span>
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                          {condLabel[l.condition] || l.condition} · {l.city}
                        </div>
                      </div>
                      {isSelected && (
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--accent)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                          <Icon name="check" size={11} stroke={2.5} style={{ color: '#fff' }}/>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="field-group" style={{ marginBottom: 12 }}>
                <label>Novčana doplata uz oglas <span style={{ fontWeight: 400, color: 'var(--ink-3)' }}>(opciono)</span></label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="100"
                    value={cash}
                    onChange={e => setCash(e.target.value)}
                    placeholder="npr. 2000"
                    style={{ paddingRight: 48 }}
                  />
                  <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', pointerEvents: 'none' }}>RSD</span>
                </div>
                {cashNum > 0 && (
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>
                    Nudiš: <b style={{ color: 'var(--accent)' }}>{cashNum.toLocaleString('sr-RS')} RSD</b> + izabrani oglas
                  </div>
                )}
              </div>

              <div className="field-group">
                <label>Poruka <span style={{ fontWeight: 400, color: 'var(--ink-3)' }}>(opciono)</span></label>
                <textarea
                  className="textarea"
                  value={msg}
                  onChange={e => setMsg(e.target.value)}
                  placeholder="Dodaj kratku napomenu uz ponudu…"
                  rows={2}
                />
              </div>

              {err && (
                <div style={{ padding: '10px 14px', background: '#fff0ee', border: '1px solid #fdc5bc', borderRadius: 8, fontSize: 13, color: 'var(--warn)', marginTop: 8 }}>
                  {err}
                </div>
              )}
            </>
          )}
        </div>
        {myListings !== null && !isBarter && noListings && (
          <div className="mf">
            <button className="nav-btn" onClick={onClose} disabled={loading}>Odustani</button>
            <button className="nav-btn primary" onClick={submit} disabled={loading || !item.price}>
              {loading ? 'Šalje se…' : '💸 Pošalji ponudu'}
            </button>
          </div>
        )}
        {myListings !== null && myListings.length > 0 && (
          <div className="mf">
            <button className="nav-btn" onClick={onClose} disabled={loading}>Odustani</button>
            <button className="nav-btn primary" onClick={submit} disabled={loading || !selected}>
              {loading ? 'Šalje se…' : '🔄 Pošalji ponudu'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── LISTING MINI (za prikaz u chat karticama) ──── */
function ListingMini({ listing }) {
  if (!listing) return <div style={{ width: 90, height: 90, borderRadius: 10, background: '#f0ede4', display: 'grid', placeItems: 'center', fontSize: 24 }}>📦</div>;
  return (
    <div style={{ width: 90, textAlign: 'center' }}>
      <div style={{ width: 90, height: 90, borderRadius: 10, overflow: 'hidden', background: '#f0ede4', display: 'grid', placeItems: 'center', marginBottom: 6 }}>
        {listing.image
          ? <img src={listing.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
          : <span style={{ fontSize: 28 }}>📦</span>
        }
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.3, color: 'var(--ink)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
        {listing.title}
      </div>
      {listing.city && (
        <div style={{ fontSize: 10, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{listing.city}</div>
      )}
    </div>
  );
}

function OfferCard({ msg, who, currentUserId, onOfferAction, isReviewed }) {
  const { offer, body } = msg;
  const [acting, setActing] = useS(null);

  const statusColor = { accepted: 'var(--good)', declined: '#e53e3e', pending: 'var(--ink-3)', completed: 'var(--good)' };
  const statusLabel = { accepted: '✓ Prihvaćeno', declined: '✗ Odbijeno', pending: '⏳ Na čekanju', completed: '✓ Završeno' };
  const me = who === 'me';

  const isRecipient = currentUserId && offer.to_user_id === currentUserId;
  const isSender    = currentUserId && offer.from_user_id === currentUserId;
  const myConfirmed    = isSender ? offer.completed_by_from : (isRecipient ? offer.completed_by_to : false);
  const otherConfirmed = isSender ? offer.completed_by_to   : (isRecipient ? offer.completed_by_from : false);

  const canRespond = offer.status === 'pending' && isRecipient;
  const canComplete = offer.status === 'accepted' && (isSender || isRecipient) && !myConfirmed;
  const canReview   = offer.status === 'completed' && (isSender || isRecipient) && !isReviewed;

  const doAct = async function(action) {
    setActing(action);
    var res;
    if (action === 'accept')   res = await apiRespondToOffer(offer.id, 'accept');
    if (action === 'decline')  res = await apiRespondToOffer(offer.id, 'decline');
    if (action === 'complete') res = await apiCompleteOffer(offer.id);
    setActing(null);
    if (res && res.ok && onOfferAction) onOfferAction(action, res);
  };

  const openListing = () => {
    const id = me ? offer.target_listing?.id : offer.offered_listing?.id;
    if (!id) return;
    const detail = { id };
    if (!me && offer.status === 'pending') {
      detail.offer = offer;
      detail.senderUsername = msg.sender;
    }
    window.dispatchEvent(new CustomEvent('dj:viewListing', { detail }));
  };

  const linkId = me ? offer.target_listing?.id : offer.offered_listing?.id;

  return (
    <div style={{ alignSelf: me ? 'flex-end' : 'flex-start', maxWidth: '88%' }}>
      <div style={{ background: '#fff', border: '1.5px solid var(--line)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
        <div style={{ padding: '7px 14px', background: 'var(--accent-soft)', borderBottom: '1px solid var(--line)', fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '.07em', color: 'var(--accent)' }}>
          🔄 PREDLOG RAZMENE
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
          <ListingMini listing={offer.offered_listing}/>
          <div style={{ fontSize: 22, color: 'var(--ink-3)', flexShrink: 0 }}>⇄</div>
          <ListingMini listing={offer.target_listing}/>
        </div>
        {offer.cash_offer > 0 && (
          <div style={{ padding: '0 16px 8px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <span style={{ color: 'var(--ink-3)' }}>+ doplata:</span>
            <span style={{ fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
              {offer.cash_offer.toLocaleString('sr-RS')} RSD
            </span>
          </div>
        )}
        {body ? (
          <div style={{ padding: '0 16px 10px', fontSize: 13, color: 'var(--ink-2)', fontStyle: 'italic' }}>„{body}"</div>
        ) : null}
        <div style={{ padding: '8px 16px 10px', borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: statusColor[offer.status] || 'var(--ink-3)' }}>
            {statusLabel[offer.status] || offer.status}
          </div>
          {linkId && (
            <button
              onClick={openListing}
              style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-mono)', letterSpacing: '.04em', whiteSpace: 'nowrap' }}
            >
              Pogledaj oglas ↗
            </button>
          )}
        </div>

        {offer.status === 'accepted' && otherConfirmed && !myConfirmed && (
          <div style={{ padding: '0 16px 6px', fontSize: 12, color: '#b7791f', fontStyle: 'italic' }}>
            Druga strana je potvrdila — čeka se tvoja potvrda.
          </div>
        )}

        {(canRespond || canComplete || canReview) && (
          <div style={{ padding: '0 16px 14px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {canRespond && (
              <>
                <button className="nav-btn primary" onClick={() => doAct('accept')} disabled={!!acting} style={{ fontSize: 12 }}>
                  {acting === 'accept' ? '…' : '✓ Prihvati'}
                </button>
                <button className="nav-btn" onClick={() => doAct('decline')} disabled={!!acting} style={{ fontSize: 12, color: 'var(--warn)', borderColor: 'var(--warn)' }}>
                  {acting === 'decline' ? '…' : '✗ Odbij'}
                </button>
              </>
            )}
            {canComplete && (
              <button className="nav-btn primary" onClick={() => doAct('complete')} disabled={!!acting} style={{ fontSize: 12 }}>
                {acting === 'complete' ? '…' : '✓ Potvrdi razmenu'}
              </button>
            )}
            {canReview && (
              <button className="nav-btn" onClick={() => onOfferAction && onOfferAction('review', { offerId: offer.id })} style={{ fontSize: 12, color: '#b7791f', borderColor: '#b7791f' }}>
                ★ Ostavi ocenu
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── SAVED SCREEN ──────────────────────────────── */
function SavedScreen({ onOpenItem, onPostAd }) {
  const [listings, setListings] = useS(null);

  useE(() => {
    apiWishlist().then(function(res) {
      setListings(Array.isArray(res.results) ? res.results : []);
    });
  }, []);

  var normalized = listings ? listings.map(function(l) {
    return {
      id:        l.id,
      title:     l.title,
      price:     l.price,
      type:      l.listing_type,
      condition: l.condition,
      status:    l.status,
      city:      l.city,
      views:     l.views,
      cat:       l.category ? l.category.slug : '',
      catName:   l.category ? l.category.name : '',
      user:      l.user ? l.user.username : '',
      rating:    l.user ? l.user.rating : 0,
      seek:      l.wants_in_exchange || '',
      created:   l.created_at,
      images:    l.images || [],
      desc:      l.description || '',
    };
  }) : [];

  return (
    <section className="section" style={{ paddingTop: 32 }}>
      <div className="section-inner">
        <div className="section-head">
          <div>
            <h2>Sačuvani oglasi</h2>
            {listings !== null && (
              <div className="sub">{normalized.length} {normalized.length === 1 ? 'oglas' : normalized.length < 5 ? 'oglasa' : 'oglasa'}</div>
            )}
          </div>
        </div>

        {listings === null ? (
          <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--ink-3)', fontSize: 14 }}>
            Učitavam…
          </div>
        ) : normalized.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--ink-3)' }}>
            <div style={{ fontSize: 36, marginBottom: 14 }}>🤍</div>
            <div style={{ fontSize: 18, color: 'var(--ink-2)', marginBottom: 6, fontFamily: 'var(--font-display)' }}>
              Još nisi sačuvao/la nijedan oglas
            </div>
            <div style={{ fontSize: 13.5, marginBottom: 20 }}>
              Klikni srce na oglasu da ga sačuvaš za kasnije.
            </div>
            <button className="nav-btn primary" onClick={onPostAd}>
              <Icon name="plus" size={14}/> Postavi oglas
            </button>
          </div>
        ) : (
          <div className="list-grid">
            {normalized.map(function(l) {
              return (
                <ListingCard key={l.id} item={l} fav={true} onFav={function() {}} onClick={function() { onOpenItem(l); }}/>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── REPORT MODAL ──────────────────────────────── */
const REPORT_REASONS = [
  { value: 'spam',           label: 'Spam ili prevara' },
  { value: 'inappropriate',  label: 'Neprikladni sadržaj' },
  { value: 'duplicate',      label: 'Duplikat oglasa' },
  { value: 'wrong_category', label: 'Pogrešna kategorija' },
  { value: 'other',          label: 'Ostalo' },
];

function ReportModal({ item, onClose }) {
  const [reason, setReason]   = useS('spam');
  const [details, setDetails] = useS('');
  const [loading, setLoading] = useS(false);
  const [done, setDone]       = useS(false);

  const submit = async () => {
    setLoading(true);
    try { await apiReportListing(item.id, reason, details); } catch (e) {}
    setDone(true);
    setLoading(false);
  };

  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div className="mh">
          <h3>Prijavi oglas</h3>
          <button className="x-btn" onClick={onClose}><Icon name="x" size={16}/></button>
        </div>
        {done ? (
          <div className="mb" style={{ textAlign: 'center', padding: '32px 24px' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
              <Icon name="check" size={28} stroke={2.4}/>
            </div>
            <p style={{ fontWeight: 600, marginBottom: 6 }}>Hvala! Prijava je primljena.</p>
            <p style={{ color: 'var(--ink-3)', fontSize: 13, marginBottom: 20 }}>
              Pregledaćemo oglas i preduzeti odgovarajuće mere.
            </p>
            <button className="nav-btn primary" onClick={onClose}>Zatvori</button>
          </div>
        ) : (
          <>
            <div className="mb">
              <p style={{ color: 'var(--ink-3)', fontSize: 13, marginBottom: 12 }}>Razlog prijave:</p>
              {REPORT_REASONS.map(r => (
                <label key={r.value} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, cursor: 'pointer', fontSize: 14 }}>
                  <input type="radio" name="report_reason" value={r.value} checked={reason === r.value} onChange={() => setReason(r.value)} />
                  {r.label}
                </label>
              ))}
              {reason === 'other' && (
                <div className="field-group" style={{ marginTop: 8 }}>
                  <textarea
                    className="textarea"
                    value={details}
                    onChange={e => setDetails(e.target.value)}
                    placeholder="Opišite problem…"
                    rows={3}
                  />
                </div>
              )}
            </div>
            <div className="mf">
              <button className="nav-btn" onClick={onClose} disabled={loading}>Odustani</button>
              <button
                onClick={submit}
                disabled={loading}
                style={{ padding: '8px 18px', borderRadius: 10, border: 'none', background: '#e53e3e', color: '#fff', fontWeight: 600, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1 }}
              >
                {loading ? 'Šalje se…' : '⚑ Prijavi'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── LISTING DETAIL ──────────────────────────────── */
function ListingDetail({ item, onBack, onMessage, onEdit, onDelete, categories = [], currentUser = null, onLogin = null, pendingOffer = null, onOfferRespond = null, isSaved = false, onSaveToggle = null, onOpenProfile = null }) {
  const [active, setActive]           = useS(0);
  const [lightbox, setLightbox]       = useS(false);
  const [statsOpen, setStatsOpen]     = useS(false);
  const [saved, setSaved]             = useS(isSaved);
  const [savePending, setSavePending] = useS(false);
  const [fullItem, setFullItem]       = useS(item);

  useE(() => {
    apiListingDetail(item.id).then(res => {
      if (res.ok !== false) {
        setFullItem({
          ...item,
          desc:   res.description || item.desc || '',
          seek:   res.wants_in_exchange || item.seek || '',
          images: res.images && res.images.length > 0
            ? res.images.map(img => ({ url: img.url, is_cover: img.is_cover }))
            : item.images,
          views:  res.views ?? item.views,
          saves:  res.saves ?? item.saves ?? null,
        });
      }
    }).catch(() => {});
  }, [item.id]);
  const [offerSent, setOfferSent]     = useS(false);
  const [showOffer, setShowOffer]     = useS(false);
  const [showReport, setShowReport]   = useS(false);
  const [respondDone, setRespondDone] = useS(null);
  const [respondLoading, setRespondLoading] = useS(false);

  const thumbs      = fullItem.images && fullItem.images.length > 0 ? fullItem.images : [null, null, null, null];
  const catName     = (categories.find(c => c.id === fullItem.cat) || {}).name || fullItem.catName || 'Kategorija';
  const isBarter    = fullItem.type === 'barter' || fullItem.type === 'both';
  const isNew       = fullItem.condition === 'new' || fullItem.condition === 'like_new';
  const priceNum    = fullItem.price ? parseFloat(fullItem.price) : null;
  const isOwner     = currentUser && currentUser.username === fullItem.user;
  const conditionLabel = {
    new: 'Novo', like_new: 'Polovno — kao novo', good: 'Polovno — odlično',
    fair: 'Polovno — vrlo dobro', poor: 'Polovno — dobro', antique: 'Antikvitet',
  }[fullItem.condition] || fullItem.condition;

  const handleMessage = () => {
    if (!currentUser) { onLogin?.(); return; }
    onMessage?.();
  };

  const handleOffer = () => {
    if (!currentUser) { onLogin?.(); return; }
    setShowOffer(true);
  };

  const handleSave = async () => {
    if (!currentUser) { onLogin && onLogin(); return; }
    if (savePending) return;
    setSavePending(true);
    try {
      const res = await apiToggleWishlist(item.id);
      setSaved(res.saved);
      if (onSaveToggle) onSaveToggle(item.id, res.saved);
    } catch (e) {}
    setSavePending(false);
  };

  const handleReport = () => {
    if (!currentUser) { onLogin?.(); return; }
    setShowReport(true);
  };

  const handleRespond = async (action) => {
    if (!pendingOffer || respondLoading) return;
    setRespondLoading(true);
    try {
      await onOfferRespond(pendingOffer.offer.id, action);
      setRespondDone(action === 'accept' ? 'accepted' : 'declined');
    } catch (e) {}
    setRespondLoading(false);
  };

  return (
    <>
      <div>
        {pendingOffer && (
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', marginBottom: 4 }}>
            {respondDone ? (
              <div style={{
                padding: '14px 18px', borderRadius: 12,
                background: respondDone === 'accepted' ? '#f0fff4' : '#fff5f5',
                border: '1.5px solid ' + (respondDone === 'accepted' ? 'var(--good)' : '#e53e3e'),
                fontSize: 14, fontWeight: 600,
                color: respondDone === 'accepted' ? 'var(--good)' : '#e53e3e',
              }}>
                {respondDone === 'accepted' ? '✓ Razmena prihvaćena!' : '✗ Razmena odbijena.'}
              </div>
            ) : (
              <div style={{
                padding: '14px 18px', borderRadius: 12,
                background: 'var(--accent-soft)',
                border: '1.5px solid var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: 12, flexWrap: 'wrap',
              }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-mono)', letterSpacing: '.06em', marginBottom: 4 }}>
                    🔄 PREDLOG RAZMENE
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--ink)' }}>
                    <b>{pendingOffer.senderUsername}</b> nudi{' '}
                    <b>„{pendingOffer.offer.offered_listing ? pendingOffer.offer.offered_listing.title : 'oglas'}"</b>{' '}
                    u zamenu za tvoj oglas
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button
                    className="nav-btn"
                    onClick={() => handleRespond('decline')}
                    disabled={respondLoading}
                    style={{ color: '#e53e3e', borderColor: '#e53e3e' }}
                  >
                    ✗ Odbij
                  </button>
                  <button
                    className="nav-btn primary"
                    onClick={() => handleRespond('accept')}
                    disabled={respondLoading}
                  >
                    {respondLoading ? '…' : '✓ Prihvati'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="breadcrumb">
          <a onClick={onBack}>Početna</a>
          <span>/</span>
          <a onClick={onBack}>{catName}</a>
          <span>/</span>
          <span style={{ color: 'var(--ink-2)' }}>{item.title.slice(0, 40)}…</span>
        </div>
        <div className="detail">
          <div>
            <div className="gallery">
              <div className="main" style={thumbs[active] && thumbs[active].url ? { cursor: 'zoom-in' } : {}} onClick={() => { if (thumbs[active] && thumbs[active].url) setLightbox(true); }}>
                {thumbs[active] && thumbs[active].url
                  ? <img src={thumbs[active].url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                  : <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)' }}>{item.catName || '📦'}</span>
                }
              </div>
              <div className="thumbs">
                {thumbs.map((th, i) => (
                  <div
                    key={i}
                    className={'th' + (i === active ? ' active' : '')}
                    onClick={() => setActive(i)}
                    style={th && th.url ? { backgroundImage: 'url(' + th.url + ')', backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                  />
                ))}
              </div>
            </div>

            <div className="desc">
              <h3>Opis</h3>
              <p>{fullItem.desc || 'Nema opisa.'}</p>
            </div>

            <div className="specs">
              <div className="r"><span className="k">Stanje</span><span>{conditionLabel}</span></div>
              <div className="r"><span className="k">Kategorija</span><span>{catName}</span></div>
              <div className="r"><span className="k">Lokacija</span><span>{fullItem.city}</span></div>
              <div className="r"><span className="k">Pregledan</span><span>{fullItem.views} puta</span></div>
              <div className="r">
                <span className="k">Šifra oglasa</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>DZ-{String(fullItem.id).slice(-6).toUpperCase()}</span>
              </div>
            </div>
          </div>

          <div className="info">
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              {isBarter && <span className="b" style={{ background: 'var(--accent)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 11, padding: '4px 8px', borderRadius: 6, fontWeight: 700, letterSpacing: '.04em' }}>RAZMENA PRIORITET</span>}
              {isNew    && <span className="b" style={{ background: '#f4d35e', color: '#3b2e00', fontFamily: 'var(--font-mono)', fontSize: 11, padding: '4px 8px', borderRadius: 6, fontWeight: 700, letterSpacing: '.04em' }}>KAO NOVO</span>}
            </div>
            <h1>{fullItem.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ink-3)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
              <Icon name="pin" size={13}/> {fullItem.city}
            </div>
            <div className="pricerow">
              <div className={'price-big' + (isBarter && !priceNum ? ' barter' : '')}>
                {priceNum ? priceNum.toLocaleString('sr-RS') + ' rsd' : 'Razmena'}
              </div>
              {priceNum && <span style={{ color: 'var(--ink-3)', fontSize: 13 }}>· cena dogovorljiva</span>}
            </div>

            {fullItem.seek && (
              <div style={{ padding: '12px 14px', background: 'var(--accent-soft)', borderRadius: 10, fontSize: 14, color: 'var(--ink)', marginTop: 4, marginBottom: 14 }}>
                <b style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.04em' }}>U ZAMENU TRAŽIM</b><br/>
                {fullItem.seek}
              </div>
            )}

            <div className="seller">
              <div className="row">
                <div className="av">{(item.user || 'K').slice(0, 2).toUpperCase()}</div>
                <div style={{ flex: 1 }}>
                  <div
                    className="nm"
                    onClick={() => onOpenProfile && onOpenProfile(item.user)}
                    style={{ cursor: onOpenProfile ? 'pointer' : 'default' }}
                  >{item.user}</div>
                  <div className="stat">
                    <span><Icon name="star" size={11} style={{ verticalAlign: '-2px' }}/> {item.rating}</span>
                    <span style={{ color: 'var(--good)' }}>● aktivan</span>
                  </div>
                </div>
              </div>

              {!pendingOffer && (
                <>
                  <div className="actions">
                    {isOwner ? (
                      <>
                        <button className="nav-btn primary" onClick={() => onEdit(fullItem)}>
                          <Icon name="edit" size={15}/> Uredi oglas
                        </button>
                        <button
                          className="nav-btn"
                          style={{ color: fullItem.status === 'reserved' ? 'var(--accent)' : 'var(--ink-2)', borderColor: fullItem.status === 'reserved' ? 'var(--accent)' : 'var(--line)' }}
                          onClick={async () => {
                            const res = await apiReserveListing(fullItem.id);
                            if (res.ok) setFullItem(fi => ({ ...fi, status: res.status }));
                          }}
                        >
                          {fullItem.status === 'reserved' ? '● Rezervisano' : '○ Označi kao rezervisano'}
                        </button>
                        <button className="nav-btn" style={{ color: 'var(--warn)', borderColor: 'var(--warn)' }} onClick={onDelete}>
                          <Icon name="trash" size={15}/> Obriši oglas
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="nav-btn primary" onClick={handleMessage}>
                          <Icon name="msg" size={15}/> Pošalji poruku
                        </button>
                        <button
                          className="nav-btn"
                          onClick={offerSent ? undefined : handleOffer}
                          disabled={offerSent}
                          style={offerSent ? { opacity: .65, cursor: 'default' } : {}}
                        >
                          <Icon name="swap" size={15}/> {offerSent ? '✓ Ponuda poslata' : 'Predloži razmenu'}
                        </button>
                      </>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    {!isOwner && (
                      <button
                        className="nav-btn"
                        style={{ flex: 1, justifyContent: 'center', color: saved ? '#e53e3e' : undefined, borderColor: saved ? '#e53e3e' : undefined }}
                        onClick={handleSave}
                        disabled={savePending}
                      >
                        <Icon name="heart" size={15}/> {saved ? 'Sačuvano' : 'Sačuvaj'}
                      </button>
                    )}
                    <button
                      className="nav-btn"
                      style={{ flex: 1, justifyContent: 'center' }}
                      onClick={() => isOwner ? setStatsOpen(v => !v) : handleReport()}
                    >
                      {isOwner ? (statsOpen ? 'Zatvori' : 'Statistike') : 'Prijavi'}
                    </button>
                  </div>
                </>
              )}

              {isOwner && statsOpen && (
                <div style={{ marginTop: 10, padding: '12px 14px', background: 'var(--accent-soft)', borderRadius: 10, fontSize: 13, color: 'var(--ink-2)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Pregledi</span><b style={{ color: 'var(--ink)' }}>{fullItem.views ?? 0}</b>
                  </div>
                  {fullItem.saves != null && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Sačuvano</span><b style={{ color: 'var(--ink)' }}>{fullItem.saves}</b>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Šifra oglasa</span>
                    <b style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>DZ-{String(item.id).slice(-6).toUpperCase()}</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Status</span><b style={{ color: 'var(--good)' }}>{item.status || 'aktivan'}</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Kategorija</span><b style={{ color: 'var(--ink)' }}>{catName}</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Datum objave</span>
                    <b style={{ color: 'var(--ink)' }}>{item.created ? new Date(item.created).toLocaleDateString('sr-RS') : '—'}</b>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showOffer && (
        <OfferModal
          item={item}
          onClose={() => setShowOffer(false)}
          onSuccess={() => { setShowOffer(false); setOfferSent(true); }}
        />
      )}
      {showReport && (
        <ReportModal item={item} onClose={() => setShowReport(false)} />
      )}
      {lightbox && thumbs[active] && thumbs[active].url && (
        <div
          onClick={() => setLightbox(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out', padding: 20,
          }}
        >
          <img
            src={thumbs[active].url}
            alt={item.title}
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', cursor: 'default' }}
          />
          <button
            onClick={() => setLightbox(false)}
            style={{
              position: 'absolute', top: 16, right: 16,
              background: 'rgba(255,255,255,0.15)', color: '#fff',
              border: 'none', borderRadius: '50%', width: 40, height: 40,
              fontSize: 24, cursor: 'pointer', lineHeight: 1,
            }}
            aria-label="Zatvori"
          >×</button>
        </div>
      )}
    </>
  );
}

/* ─── EDIT AD MODAL ──────────────────────────────── */
function EditAdModal({ item, onClose, categories = [], onSaved }) {
  const [title, setTitle]     = useS(item.title || '');
  const [desc, setDesc]       = useS(item.desc || '');
  const [price, setPrice]     = useS(item.price ? String(item.price) : '');
  const [seek, setSeek]       = useS(item.seek || '');
  const [city, setCity]       = useS(item.city || '');
  const [cat, setCat]         = useS(item.cat || '');
  const [loading, setLoading] = useS(false);
  const [error, setError]     = useS('');

  const displayCats = categories.filter(c => c.id !== 'sve');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await apiUpdateListing(item.id, {
      title,
      description: desc,
      price: price || null,
      wants_in_exchange: seek,
      city,
      category: cat,
    });
    setLoading(false);
    if (res.ok) onSaved(res.listing);
    else setError(res.error || 'Greška pri čuvanju.');
  };

  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="mh">
          <h3>Uredi oglas</h3>
          <button className="x-btn" onClick={onClose}><Icon name="x" size={16}/></button>
        </div>
        <form className="mb" onSubmit={submit}>
          {error && (
            <div style={{ padding: '10px 14px', background: '#fff0ee', border: '1px solid #fdc5bc', borderRadius: 8, fontSize: 13, color: 'var(--warn)', marginBottom: 14 }}>
              {error}
            </div>
          )}
          <div className="field-group">
            <label>Naziv oglasa</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus/>
          </div>
          <div className="field-group">
            <label>Kategorija</label>
            <select className="select" value={cat} onChange={(e) => setCat(e.target.value)}>
              <option value="">Izaberi kategoriju…</option>
              {displayCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="field-group">
            <label>Opis</label>
            <textarea className="textarea" value={desc} onChange={(e) => setDesc(e.target.value)}/>
          </div>
          <div className="field-group">
            <label>Cena (rsd)</label>
            <input className="input" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0"/>
          </div>
          <div className="field-group">
            <label>Šta tražiš u zamenu?</label>
            <textarea className="textarea" value={seek} onChange={(e) => setSeek(e.target.value)}/>
          </div>
          <div className="field-group">
            <label>Grad</label>
            <CityPicker value={city} onChange={setCity}/>
          </div>
        </form>
        <div className="mf">
          <button className="nav-btn" onClick={onClose}>Otkaži</button>
          <button className="nav-btn primary" onClick={submit} disabled={loading}>
            {loading ? 'Čuvam…' : 'Sačuvaj izmene'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* --- POST AD MODAL --- */
function PostAdModal({ onClose, categories = [], onCreated, onView }) {
  var [step, setStep]                   = useS(1);
  var [title, setTitle]                 = useS('');
  var [imageFiles, setImageFiles]       = useS([]);
  var [imagePreviews, setImagePreviews] = useS([]);
  var [createdListing, setCreatedListing] = useS(null);
  var [mainCat, setMainCat]             = useS(null);
  var [sub, setSub]                     = useS(null);
  var [suggestions, setSuggestions]     = useS([]);
  var [condition, setCondition]         = useS('');
  var [city, setCity]                   = useS('Beograd');
  var [price, setPrice]                 = useS('');
  var [currency, setCurrency]           = useS('RSD');
  var [desc, setDesc]                   = useS('');
  var [swappable, setSwappable]         = useS(true);
  var [allowMoney, setAllowMoney]       = useS(false);
  var [wantsList, setWantsList]         = useS([]);
  var [wantsInput, setWantsInput]       = useS('');
  var [loading, setLoading]             = useS(false);
  var [error, setError]                 = useS('');
  var [done, setDone]                   = useS(false);
  var fileInputRef                      = useR(null);

  var conditionOpts = [
    { v: 'new',      l: 'Novo' },
    { v: 'like_new', l: 'Kao novo' },
    { v: 'good',     l: 'Odlicno' },
    { v: 'fair',     l: 'Vrlo dobro' },
    { v: 'poor',     l: 'Dobro' },
    { v: 'antique',  l: 'Antikvitet' },
  ];

  var stepLabels = ['Naziv i slike', 'Kategorija', 'Detalji', 'Zamena', 'Pregled'];

  var displayCats = categories.filter(function(c) { return c.slug !== 'sve'; });

  useE(function() {
    if (!title || title.length < 3) { setSuggestions([]); return; }
    var words = title.toLowerCase().split(/\s+/);
    var matched = [];
    displayCats.forEach(function(c) {
      var cWords = (c.name + ' ' + (c.slug || '')).toLowerCase();
      var cScore = 0;
      words.forEach(function(w) { if (w.length > 2 && cWords.indexOf(w) !== -1) cScore++; });
      if (c.children && c.children.length > 0) {
        c.children.forEach(function(s) {
          var sWords = (s.name + ' ' + (s.slug || '')).toLowerCase();
          var sScore = 0;
          words.forEach(function(w) { if (w.length > 2 && sWords.indexOf(w) !== -1) sScore++; });
          if (sScore > 0 || cScore > 0) {
            matched.push({ main: c, s: s, score: sScore * 2 + cScore });
          }
        });
      } else if (cScore > 0) {
        matched.push({ main: c, s: null, score: cScore });
      }
    });
    matched.sort(function(a, b) { return b.score - a.score; });
    setSuggestions(matched.slice(0, 3));
  }, [title]);

  useE(function() {
    var previews = imageFiles.map(function(f) { return URL.createObjectURL(f); });
    setImagePreviews(previews);
  }, [imageFiles]);

  var handleFileSelect = function(e) {
    var incoming = Array.from(e.target.files);
    setImageFiles(function(prev) { return prev.concat(incoming).slice(0, 10); });
  };

  var removeImage = function(i) {
    setImageFiles(function(prev) { return prev.filter(function(_, idx) { return idx !== i; }); });
  };

  var handleWantsKey = function(e) {
    if (e.key === 'Enter' && wantsInput.trim()) {
      e.preventDefault();
      var val = wantsInput.trim();
      setWantsList(function(prev) { return prev.concat([val]); });
      setWantsInput('');
    }
  };

  var removeWant = function(i) {
    setWantsList(function(prev) { return prev.filter(function(_, idx) { return idx !== i; }); });
  };

  var canProceed = (function() {
    if (step === 1) return title.trim().length >= 3;
    if (step === 2) return !!(sub || mainCat);
    if (step === 3) return !!(condition && city.trim() && desc.trim());
    return true;
  })();

  var next = function() { if (canProceed) setStep(function(s) { return Math.min(5, s + 1); }); };
  var prev = function() { setStep(function(s) { return Math.max(1, s - 1); }); };

  var submit = async function() {
    setError('');
    setLoading(true);
    var listingType = 'barter';
    if (swappable && allowMoney) listingType = 'both';
    else if (allowMoney) listingType = 'sell';
    var catSlug = sub ? sub.slug : (mainCat ? mainCat.slug : '');
    var res = await apiCreateListing({
      title:             title.trim(),
      description:       desc.trim(),
      listing_type:      listingType,
      category:          catSlug,
      price:             price || null,
      wants_in_exchange: (wantsInput.trim() ? [...wantsList, wantsInput.trim()] : wantsList).join(', '),
      city:              city.trim(),
      condition:         condition,
    });
    if (!res.ok) {
      if (res.error === 'email_not_verified') {
        setError('Moraš verifikovati email adresu pre postavljanja oglasa. Proveri inbox ili pošalji novi verifikacioni email iz Podešavanja.');
      } else {
        setError(res.error || ('Greška pri objavljivanju. Status: ' + res.status));
      }
      setLoading(false);
      return;
    }
    if (imageFiles.length > 0) {
      var imgRes = await apiUploadImages(res.listing.id, imageFiles);
      if (imgRes.ok && imgRes.images) res.listing.images = imgRes.images;
    }
    setLoading(false);
    setCreatedListing(res.listing);
    setDone(true);
    if (onCreated) onCreated(res.listing);
  };

  if (done) {
    return (
      <div className="scrim" onClick={onClose}>
        <div className="modal" onClick={function(e) { e.stopPropagation(); }} style={{ maxWidth: 480 }}>
          <div className="mb" style={{ textAlign: 'center', padding: '40px 32px' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'grid', placeItems: 'center', margin: '0 auto 18px' }}>
              <Icon name="check" size={30} stroke={2.4}/>
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', margin: '0 0 8px', fontSize: 24 }}>Oglas je objavljen!</h3>
            <p style={{ color: 'var(--ink-3)', margin: '0 0 22px', fontSize: 14.5 }}>
              Tvoj oglas <b style={{ color: 'var(--ink)' }}>"{title}"</b> je sada vidljiv.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button className="nav-btn" onClick={onClose}>Zatvori</button>
              <button className="nav-btn primary" onClick={function() { onClose(); if (onView && createdListing) onView(createdListing); }}>Pogledaj oglas</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal" onClick={function(e) { e.stopPropagation(); }} style={{ maxWidth: 720 }}>
        <div className="mh">
          <h3>Postavi oglas</h3>
          <button className="x-btn" onClick={onClose}><Icon name="x" size={16}/></button>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', padding: '0 24px 16px', gap: 0 }}>
          {stepLabels.map(function(label, idx) {
            var n = idx + 1;
            var isDone = step > n;
            var isActive = step === n;
            return (
              React.createElement(React.Fragment, { key: n },
                React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 0 auto' } },
                  React.createElement('div', {
                    style: {
                      width: 28, height: 28, borderRadius: '50%',
                      background: isDone ? '#22c55e' : isActive ? 'var(--accent)' : 'var(--line)',
                      color: (isDone || isActive) ? '#fff' : 'var(--ink-3)',
                      display: 'grid', placeItems: 'center',
                      fontSize: 12, fontWeight: 700, transition: 'background .2s',
                    }
                  }, isDone ? '✓' : n),
                  React.createElement('div', {
                    style: {
                      fontSize: 9, marginTop: 4, fontFamily: 'var(--font-mono)',
                      whiteSpace: 'nowrap', textAlign: 'center',
                      color: isActive ? 'var(--accent)' : 'var(--ink-3)',
                    }
                  }, label)
                ),
                idx < stepLabels.length - 1
                  ? React.createElement('div', {
                      style: {
                        flex: 1, height: 2, margin: '14px 4px 0',
                        background: step > n ? '#22c55e' : 'var(--line)',
                        transition: 'background .2s',
                      }
                    })
                  : null
              )
            );
          })}
        </div>

        <div className="mb">
          {error && (
            <div style={{ padding: '10px 14px', background: '#fff0ee', border: '1px solid #fdc5bc', borderRadius: 8, fontSize: 13, color: 'var(--warn)', marginBottom: 14 }}>
              {error}
            </div>
          )}

          {step === 1 && (
            <div>
              <div className="field-group">
                <label>Naziv oglasa</label>
                <input className="input" value={title} onChange={function(e) { setTitle(e.target.value); }} placeholder="npr. Bicikl Capriolo MTB 27.5, malo korisćen" autoFocus/>
                <div className="hint">Budi konkretan — dobar naziv donosi više pregleda.</div>
              </div>
              <div className="field-group">
                <label>
                  Fotografije
                  <span style={{ color: 'var(--ink-3)', fontWeight: 400, fontSize: 12, marginLeft: 6 }}>· do 10, prva je naslovna</span>
                </label>
                <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFileSelect}/>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
                  {[0,1,2,3,4].map(function(i) {
                    var url = imagePreviews[i] || null;
                    return (
                      <div
                        key={i}
                        onClick={function() { fileInputRef.current.click(); }}
                        style={{
                          aspectRatio: '1/1', borderRadius: 10,
                          border: url ? '2px solid var(--accent)' : '1px dashed var(--ink-4)',
                          display: 'grid', placeItems: 'center',
                          color: 'var(--ink-3)', cursor: 'pointer',
                          background: url ? 'transparent' : '#faf8f1',
                          overflow: 'hidden', position: 'relative',
                        }}
                      >
                        {url ? (
                          React.createElement(React.Fragment, null,
                            React.createElement('img', { src: url, style: { width: '100%', height: '100%', objectFit: 'cover' } }),
                            i === 0
                              ? React.createElement('span', {
                                  style: {
                                    position: 'absolute', bottom: 3, left: 3,
                                    background: 'var(--accent)', color: '#fff',
                                    fontSize: 7, fontWeight: 700, padding: '2px 4px',
                                    borderRadius: 3, fontFamily: 'var(--font-mono)', letterSpacing: '.04em',
                                  }
                                }, 'NASLOVNA')
                              : null,
                            React.createElement('button', {
                              onClick: function(e) { e.stopPropagation(); removeImage(i); },
                              style: {
                                position: 'absolute', top: 3, right: 3,
                                width: 18, height: 18, borderRadius: '50%',
                                background: 'rgba(0,0,0,.5)', border: 0,
                                color: '#fff', cursor: 'pointer',
                                display: 'grid', placeItems: 'center', fontSize: 11, lineHeight: 1,
                              }
                            }, '×')
                          )
                        ) : (
                          React.createElement(Icon, { name: i === 0 ? 'camera' : 'plus', size: 16 })
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="hint">
                  {imageFiles.length > 0
                    ? (imageFiles.length + (imageFiles.length === 1 ? ' slika izabrana' : ' slike izabrane') + ' · klikni za dodavanje')
                    : 'Klikni na kvadrat da dodas fotografije'}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              {suggestions.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ink-3)', letterSpacing: '.06em', marginBottom: 8 }}>PRIJEDLOZI</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {suggestions.map(function(sg, idx) {
                      var lbl = sg.s ? (sg.main.name + ' › ' + sg.s.name) : sg.main.name;
                      var isSel = sg.s
                        ? (sub && sub.slug === sg.s.slug)
                        : (mainCat && mainCat.slug === sg.main.slug && !sub);
                      return (
                        <button
                          key={idx}
                          onClick={function() { setMainCat(sg.main); setSub(sg.s || null); }}
                          style={{
                            padding: '6px 12px', borderRadius: 20, fontSize: 13,
                            border: isSel ? '2px solid var(--accent)' : '1px solid var(--line)',
                            background: isSel ? 'var(--accent-soft)' : '#fff',
                            color: isSel ? 'var(--accent)' : 'var(--ink-2)',
                            cursor: 'pointer', fontWeight: isSel ? 700 : 400,
                          }}
                        >
                          {lbl}{sg.s && sg.s.count ? ' (' + sg.s.count + ')' : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {!mainCat ? (
                <div>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ink-3)', letterSpacing: '.06em', marginBottom: 10 }}>SVE KATEGORIJE</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                    {displayCats.map(function(c) {
                      return (
                        <button
                          key={c.id}
                          onClick={function() { setMainCat(c); setSub(null); }}
                          style={{
                            padding: '12px 10px', borderRadius: 10, fontSize: 13,
                            border: '1px solid var(--line)', background: '#fff',
                            color: 'var(--ink)', cursor: 'pointer', textAlign: 'center', fontWeight: 500,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                          }}
                        >
                          {c.icon
                            ? React.createElement(Icon, { name: c.icon, size: 20, style: { color: 'var(--accent)', flexShrink: 0 } })
                            : null}
                          <span style={{ lineHeight: 1.2 }}>{c.name}</span>
                          {c.children && c.children.length > 0 && (
                            <span style={{ fontSize: 10, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
                              {c.children.length + ' podkat.'}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div>
                  <button
                    onClick={function() { setMainCat(null); setSub(null); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 0, cursor: 'pointer', color: 'var(--accent)', fontSize: 13, fontWeight: 600, marginBottom: 12, padding: 0 }}
                  >
                    <Icon name="arrow-l" size={14}/> {mainCat.name}
                  </button>
                  {mainCat.children && mainCat.children.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                      {mainCat.children.map(function(s) {
                        var isSel = sub && sub.slug === s.slug;
                        return (
                          <button
                            key={s.id}
                            onClick={function() { setSub(s); }}
                            style={{
                              padding: '10px 12px', borderRadius: 10, fontSize: 13,
                              border: isSel ? '2px solid var(--accent)' : '1px solid var(--line)',
                              background: isSel ? 'var(--accent-soft)' : '#fff',
                              color: isSel ? 'var(--accent)' : 'var(--ink)',
                              cursor: 'pointer', textAlign: 'left', fontWeight: isSel ? 700 : 400,
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6,
                            }}
                          >
                            <span>{s.name}</span>
                            {s.count ? (
                              <span style={{ fontSize: 10, color: isSel ? 'var(--accent)' : 'var(--ink-3)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                                {s.count}
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
                      Nema podkategorija. Nastavi s ovom kategorijom.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="field-group">
                <label>Cena (RSD)</label>
                <input className="input" value={price} onChange={function(e) { setPrice(e.target.value); }} placeholder="0" type="number" min="0"/>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div className="field-group" style={{ margin: 0 }}>
                  <label>Grad</label>
                  <CityPicker value={city} onChange={setCity}/>
                </div>
                <div className="field-group" style={{ margin: 0 }}>
                  <label>Stanje</label>
                  <select className="select" value={condition} onChange={function(e) { setCondition(e.target.value); }}>
                    <option value="">Izaberi...</option>
                    {conditionOpts.map(function(o) { return React.createElement('option', { key: o.v, value: o.v }, o.l); })}
                  </select>
                </div>
              </div>
              <div className="field-group">
                <label>Opis</label>
                <textarea className="textarea" value={desc} onChange={function(e) { setDesc(e.target.value); }} placeholder="Opiši stanje, dimenzije, šta je uključeno..." rows={4}/>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 14 }}>Kako možeš primiti ovaj predmet?</div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 14 }}>
                  <input type="checkbox" checked={swappable} onChange={function(e) { setSwappable(e.target.checked); }} style={{ width: 18, height: 18 }}/>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Razmena</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>Primam predmete u zamenu</div>
                  </div>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input type="checkbox" checked={allowMoney} onChange={function(e) { setAllowMoney(e.target.checked); }} style={{ width: 18, height: 18 }}/>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Prodaja</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>Primam novac</div>
                  </div>
                </label>
              </div>
              {swappable && (
                <div className="field-group">
                  <label>Šta tražiš u zamenu?</label>
                  {wantsList.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                      {wantsList.map(function(w, i) {
                        return (
                          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: 'var(--accent-soft)', color: 'var(--accent)', borderRadius: 20, fontSize: 13, fontWeight: 500 }}>
                            {w}
                            <button onClick={function() { removeWant(i); }} style={{ background: 'none', border: 0, cursor: 'pointer', color: 'var(--accent)', fontSize: 15, lineHeight: 1, padding: 0, display: 'grid', placeItems: 'center' }}>×</button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <input
                    className="input"
                    value={wantsInput}
                    onChange={function(e) { setWantsInput(e.target.value); }}
                    onKeyDown={handleWantsKey}
                    placeholder="npr. knjige, biljke... (Enter za dodavanje)"
                  />
                  <div className="hint">Pritisni Enter da dodas stavku.</div>
                </div>
              )}
            </div>
          )}

          {step === 5 && (
            <div>
              <div style={{ padding: 16, background: '#faf8f1', borderRadius: 12, marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ink-3)', letterSpacing: '.06em', marginBottom: 10 }}>PREGLED OGLASA</div>
                {imagePreviews.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, marginBottom: 12, overflowX: 'auto' }}>
                    {imagePreviews.map(function(url, i) {
                      return (
                        <img key={i} src={url} style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: i === 0 ? '2px solid var(--accent)' : '1px solid var(--line)' }}/>
                      );
                    })}
                  </div>
                )}
                <div style={{ fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 8 }}>{title || 'Bez naziva'}</div>
                <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '3px 0', color: 'var(--ink-3)', width: 110 }}>Kategorija</td>
                      <td style={{ padding: '3px 0', fontWeight: 500 }}>
                        {sub
                          ? (mainCat ? mainCat.name + ' › ' + sub.name : sub.name)
                          : (mainCat ? mainCat.name : '—')}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 0', color: 'var(--ink-3)' }}>Stanje</td>
                      <td style={{ padding: '3px 0', fontWeight: 500 }}>
                        {(conditionOpts.find(function(o) { return o.v === condition; }) || {}).l || '—'}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 0', color: 'var(--ink-3)' }}>Grad</td>
                      <td style={{ padding: '3px 0', fontWeight: 500 }}>{city || '—'}</td>
                    </tr>
                    {price ? (
                      <tr>
                        <td style={{ padding: '3px 0', color: 'var(--ink-3)' }}>Cena</td>
                        <td style={{ padding: '3px 0', fontWeight: 500 }}>{price + ' ' + currency}</td>
                      </tr>
                    ) : null}
                    <tr>
                      <td style={{ padding: '3px 0', color: 'var(--ink-3)' }}>Tip</td>
                      <td style={{ padding: '3px 0', fontWeight: 500 }}>
                        {swappable && allowMoney ? 'Razmena i prodaja' : swappable ? 'Razmena' : 'Prodaja'}
                      </td>
                    </tr>
                    {wantsList.length > 0 ? (
                      <tr>
                        <td style={{ padding: '3px 0', color: 'var(--ink-3)' }}>Tražim</td>
                        <td style={{ padding: '3px 0', fontWeight: 500 }}>{(wantsInput.trim() ? [...wantsList, wantsInput.trim()] : wantsList).join(', ')}</td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
                {desc ? (
                  <div style={{ marginTop: 10, fontSize: 13, color: 'var(--ink-2)', borderTop: '1px solid var(--line)', paddingTop: 10 }}>{desc}</div>
                ) : null}
              </div>
              <label style={{ display: 'flex', gap: 10, fontSize: 13.5, color: 'var(--ink-2)', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked/>
                Slažem se sa <a style={{ color: 'var(--accent)', fontWeight: 600 }}>pravilima zajednice</a>
              </label>
            </div>
          )}
        </div>

        <div className="mf">
          <button className="nav-btn" onClick={step === 1 ? onClose : prev}>
            {step === 1 ? 'Otkaži' : 'Nazad'}
          </button>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
            {stepLabels[step - 1]}
          </div>
          <button className="nav-btn primary" onClick={step === 5 ? submit : next} disabled={!canProceed || loading}>
            {loading ? 'Objavljujem...' : step === 5 ? 'Objavi oglas' : 'Dalje'}
            {step !== 5 && !loading && React.createElement(Icon, { name: 'arrow-r', size: 14, stroke: 2 })}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── STAR RATING ──────────────────────────────── */
function StarRating({ value, onChange, size }) {
  var s = size || 28;
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1,2,3,4,5].map(function(n) {
        return (
          <span
            key={n}
            onClick={function() { if (onChange) onChange(n); }}
            style={{
              fontSize: s, cursor: onChange ? 'pointer' : 'default',
              color: n <= value ? '#f6ad55' : 'var(--line)',
              lineHeight: 1, userSelect: 'none',
              transition: 'color .1s',
            }}
          >★</span>
        );
      })}
    </div>
  );
}

/* ─── REVIEW MODAL ──────────────────────────────── */
function ReviewModal({ offer, onClose, onSuccess }) {
  var [rating, setRating]   = useS(0);
  var [comment, setComment] = useS('');
  var [loading, setLoading] = useS(false);
  var [error, setError]     = useS('');

  var submit = async function() {
    if (!rating) { setError('Izaberi ocenu od 1 do 5 zvezdica.'); return; }
    setLoading(true);
    setError('');
    var res = await apiReviewOffer(offer.id, rating, comment);
    setLoading(false);
    if (res.ok) onSuccess();
    else setError(res.error || 'Greška pri slanju ocene.');
  };

  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal" onClick={function(e) { e.stopPropagation(); }} style={{ maxWidth: 440 }}>
        <div className="mh">
          <h3>Ostavi ocenu</h3>
          <button className="x-btn" onClick={onClose}><Icon name="x" size={16}/></button>
        </div>
        <div className="mb">
          <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 6 }}>
            Razmena za oglas:
          </p>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 20 }}>
            {offer.listing ? offer.listing.title : '—'}
          </p>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 8 }}>
            Oceni korisnika <b style={{ color: 'var(--ink)' }}>{offer.other_user}</b>:
          </p>
          <div style={{ marginBottom: 20 }}>
            <StarRating value={rating} onChange={setRating} size={36}/>
            {rating > 0 && (
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 6, fontFamily: 'var(--font-mono)' }}>
                {['', 'Loše', 'Prihvatljivo', 'Dobro', 'Vrlo dobro', 'Odlično'][rating]}
              </div>
            )}
          </div>
          <div className="field-group">
            <label>Komentar (opciono)</label>
            <textarea
              className="textarea"
              value={comment}
              onChange={function(e) { setComment(e.target.value); }}
              placeholder="Opiši iskustvo razmene…"
              rows={3}
            />
          </div>
          {error && (
            <div style={{ padding: '10px 14px', background: '#fff0ee', border: '1px solid #fdc5bc', borderRadius: 8, fontSize: 13, color: 'var(--warn)', marginTop: 8 }}>
              {error}
            </div>
          )}
        </div>
        <div className="mf">
          <button className="nav-btn" onClick={onClose} disabled={loading}>Odustani</button>
          <button className="nav-btn primary" onClick={submit} disabled={loading || !rating}>
            {loading ? 'Šalje se…' : '★ Pošalji ocenu'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── RATINGS SCREEN ──────────────────────────────── */
function RatingsScreen({ onOpenItem }) {
  var [tab, setTab]               = useS('swaps');
  var [offers, setOffers]         = useS(null);
  var [reviews, setReviews]       = useS(null);
  var [reviewTarget, setReviewTarget] = useS(null);
  var [completing, setCompleting] = useS(null);

  useE(function() {
    apiMyOffers().then(function(res) {
      setOffers(Array.isArray(res.results) ? res.results : []);
    });
    apiMyReviews().then(function(res) {
      setReviews(Array.isArray(res.results) ? res.results : []);
    });
  }, []);

  var handleComplete = async function(offerId) {
    setCompleting(offerId);
    var res = await apiCompleteOffer(offerId);
    if (res.ok) {
      setOffers(function(prev) {
        return prev.map(function(o) {
          return o.id === offerId
            ? Object.assign({}, o, { status: 'completed', can_complete: false, can_review: true })
            : o;
        });
      });
    }
    setCompleting(null);
  };

  var handleReviewSuccess = function(offerId) {
    setReviewTarget(null);
    setOffers(function(prev) {
      return prev.map(function(o) {
        return o.id === offerId
          ? Object.assign({}, o, { can_review: false, i_reviewed: true })
          : o;
      });
    });
  };

  var STATUS_LABEL = { pending: 'Na čekanju', accepted: 'Prihvaćena', declined: 'Odbijena', completed: 'Završena', cancelled: 'Otkazana' };
  var STATUS_COLOR = { pending: '#b7791f', accepted: '#276749', declined: '#e53e3e', completed: '#276749', cancelled: 'var(--ink-3)' };
  var STATUS_BG    = { pending: '#fefcbf', accepted: '#f0fff4', declined: '#fff5f5', completed: '#f0fff4', cancelled: '#f5f5f5' };

  return (
    <section className="section" style={{ paddingTop: 32 }}>
      <div className="section-inner">
        <div className="section-head">
          <div>
            <h2>Ocene i istorija</h2>
            <div className="sub">Tvoje razmene i primljene ocene</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--line)', paddingBottom: 0 }}>
          {[
            { id: 'swaps',   label: 'Razmene', count: offers ? offers.length : null },
            { id: 'reviews', label: 'Ocene',   count: reviews ? reviews.length : null },
          ].map(function(t) {
            return (
              <button
                key={t.id}
                onClick={function() { setTab(t.id); }}
                style={{
                  padding: '10px 18px', border: 'none', background: 'none',
                  borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
                  color: tab === t.id ? 'var(--accent)' : 'var(--ink-2)',
                  fontWeight: tab === t.id ? 700 : 500, fontSize: 14,
                  cursor: 'pointer', marginBottom: -1, transition: 'all .15s',
                }}
              >
                {t.label}
                {t.count !== null && (
                  <span style={{
                    marginLeft: 6, fontSize: 11, fontFamily: 'var(--font-mono)',
                    background: tab === t.id ? 'var(--accent-soft)' : 'var(--line)',
                    color: tab === t.id ? 'var(--accent)' : 'var(--ink-3)',
                    padding: '1px 6px', borderRadius: 8,
                  }}>{t.count}</span>
                )}
              </button>
            );
          })}
        </div>

        {tab === 'swaps' && (
          offers === null ? (
            <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--ink-3)', fontSize: 14 }}>Učitavam…</div>
          ) : offers.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--ink-3)' }}>
              <div style={{ fontSize: 36, marginBottom: 14 }}>🔄</div>
              <div style={{ fontSize: 18, color: 'var(--ink-2)', marginBottom: 6, fontFamily: 'var(--font-display)' }}>
                Još nemaš razmena
              </div>
              <div style={{ fontSize: 13.5 }}>Kad pošalješ ili primiš ponudu za razmenu, pojaviće se ovde.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {offers.map(function(offer) {
                var isCompleting = completing === offer.id;
                return (
                  <div
                    key={offer.id}
                    style={{
                      background: '#fff', border: '1px solid var(--line)',
                      borderRadius: 12, padding: '14px 16px',
                      display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
                    }}
                  >
                    <div style={{
                      width: 56, height: 56, borderRadius: 8, flexShrink: 0,
                      background: '#f0ede4', overflow: 'hidden', display: 'grid', placeItems: 'center',
                    }}>
                      {offer.listing && offer.listing.image
                        ? <img src={offer.listing.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                        : <span style={{ fontSize: 22 }}>📦</span>
                      }
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {offer.listing ? offer.listing.title : '—'}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', marginTop: 3 }}>
                        {offer.is_sender ? 'Ti → ' : '← Ti · od '}{offer.other_user}
                        {' · '}{new Date(offer.created_at).toLocaleDateString('sr-RS')}
                      </div>
                      {offer.offered_listing && (
                        <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 3 }}>
                          Ponuđeno: <b>{offer.offered_listing.title}</b>
                          {offer.cash_offer > 0 && (
                            <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', marginLeft: 6 }}>
                              + {offer.cash_offer.toLocaleString('sr-RS')} RSD
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                        fontFamily: 'var(--font-mono)', letterSpacing: '.04em',
                        color: STATUS_COLOR[offer.status] || 'var(--ink-3)',
                        background: STATUS_BG[offer.status] || '#f5f5f5',
                      }}>
                        {STATUS_LABEL[offer.status] || offer.status}
                      </span>

                      {offer.can_complete && (
                        <button
                          className="nav-btn primary"
                          onClick={function() { handleComplete(offer.id); }}
                          disabled={isCompleting}
                          style={{ fontSize: 12 }}
                        >
                          {isCompleting ? '…' : '✓ Potvrdi razmenu'}
                        </button>
                      )}
                      {offer.status === 'accepted' && offer.i_confirmed && !offer.can_complete && offer.status !== 'completed' && (
                        <span style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
                          ⏳ Čeka se potvrda druge strane
                        </span>
                      )}

                      {offer.can_review && (
                        <button
                          className="nav-btn"
                          onClick={function() { setReviewTarget(offer); }}
                          style={{ fontSize: 12, color: '#b7791f', borderColor: '#b7791f' }}
                        >
                          ★ Ostavi ocenu
                        </button>
                      )}

                      {offer.i_reviewed && offer.status === 'completed' && (
                        <span style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
                          ✓ Ocenjeno
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {tab === 'reviews' && (
          reviews === null ? (
            <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--ink-3)', fontSize: 14 }}>Učitavam…</div>
          ) : reviews.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--ink-3)' }}>
              <div style={{ fontSize: 36, marginBottom: 14 }}>★</div>
              <div style={{ fontSize: 18, color: 'var(--ink-2)', marginBottom: 6, fontFamily: 'var(--font-display)' }}>
                Još nemaš ocena
              </div>
              <div style={{ fontSize: 13.5 }}>Završi razmenu i drugi korisnici će moći da te ocenjuju.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {reviews.map(function(r) {
                return (
                  <div
                    key={r.id}
                    style={{
                      background: '#fff', border: '1px solid var(--line)',
                      borderRadius: 12, padding: '14px 16px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'var(--accent-soft)', color: 'var(--accent)',
                        display: 'grid', placeItems: 'center',
                        fontWeight: 700, fontSize: 13,
                      }}>
                        {r.from_user.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{r.from_user}</div>
                        <div style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
                          {new Date(r.created_at).toLocaleDateString('sr-RS')}
                          {r.listing ? ' · ' + r.listing : ''}
                        </div>
                      </div>
                      <div style={{ marginLeft: 'auto' }}>
                        <StarRating value={r.rating} size={18}/>
                      </div>
                    </div>
                    {r.comment && (
                      <div style={{
                        fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.6,
                        padding: '8px 12px', background: '#faf8f1', borderRadius: 8,
                        fontStyle: 'italic',
                      }}>
                        „{r.comment}"
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      {reviewTarget && (
        <ReviewModal
          offer={reviewTarget}
          onClose={function() { setReviewTarget(null); }}
          onSuccess={function() { handleReviewSuccess(reviewTarget.id); }}
        />
      )}
    </section>
  );
}

/* ─── RAZMENE DRAWER ──────────────────────────────── */
function RazmeneDrawer({ onClose, currentUser, targetListing }) {
  const [threads, setThreads]         = useS([]);
  const [active, setActive]           = useS(null);
  const [messages, setMessages]       = useS([]);
  const [text, setText]               = useS('');
  const [loading, setLoading]         = useS(true);
  const [sending, setSending]         = useS(false);
  const [reviewTarget, setReviewTarget]       = useS(null);
  const [reviewedOfferIds, setReviewedOfferIds] = useS([]);
  const [mobileView, setMobileView]   = useS('list');
  const isMobile                      = window.innerWidth < 640;
  const bottomRef = useR(null);
  const activeRef = useR(null);

  useE(() => { activeRef.current = active; }, [active]);

  const refreshMessages = function() {
    if (!activeRef.current) return;
    apiChatMessages(activeRef.current.id).then(function(res) {
      if (Array.isArray(res.results)) setMessages(res.results);
    });
  };

  const handleOfferAction = function(action, res) {
    if (action === 'review') {
      var a = activeRef.current;
      setReviewTarget({
        id:         res.offerId,
        other_user: a ? a.other_user?.username : '',
        listing:    a ? a.listing : null,
      });
    } else {
      refreshMessages();
    }
  };

  const handleReviewSuccess = function() {
    if (reviewTarget) {
      setReviewedOfferIds(function(prev) { return prev.concat(reviewTarget.id); });
    }
    setReviewTarget(null);
  };

  useE(() => {
    var loadInbox = function(targetConvId) {
      apiInbox().then(function(res) {
        if (Array.isArray(res.results)) {
          setThreads(res.results);
          if (targetConvId) {
            var match = res.results.find(function(t) { return t.id === targetConvId; });
            setActive(match || (res.results.length > 0 ? res.results[0] : null));
          } else if (res.results.length > 0) {
            setActive(res.results[0]);
          }
        }
        setLoading(false);
      });
    };

    if (targetListing) {
      apiStartThread(targetListing.id).then(function(res) {
        loadInbox(res.ok ? res.conversation_id : null);
      });
    } else {
      loadInbox(null);
    }
  }, []);

  useE(() => {
    if (!active) return;
    const id = active.id;
    apiChatMessages(id).then(res => {
      if (Array.isArray(res.results)) setMessages(res.results);
    });
  }, [active?.id]);

  useE(() => {
    if (!active) return;
    const iv = setInterval(() => {
      apiChatMessages(active.id).then(res => {
        if (Array.isArray(res.results)) setMessages(res.results);
      });
    }, 3000);
    return () => clearInterval(iv);
  }, [active?.id]);

  useE(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || !active) return;
    setSending(true);
    const res = await apiSendMessage(active.id, text.trim());
    setSending(false);
    if (res.ok && res.message) {
      setMessages(prev => [...prev, res.message]);
      setText('');
    }
  };

  const handleDeleteMessage = async (msgId) => {
    const res = await apiDeleteMessage(active.id, msgId);
    if (res.ok) setMessages(prev => prev.filter(m => m.id !== msgId));
  };

  const handleDeleteConversation = async () => {
    if (!window.confirm('Obrisati ceo chat? Ova radnja se ne može poništiti.')) return;
    const res = await apiDeleteConversation(active.id);
    if (res.ok) {
      const remaining = threads.filter(t => t.id !== active.id);
      setThreads(remaining);
      setActive(remaining.length > 0 ? remaining[0] : null);
      setMessages([]);
      if (isMobile) setMobileView('list');
    }
  };

  const fmtTime = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' });
  };

  const openThread = (t) => {
    setActive(t);
    setMessages([]);
    if (isMobile) setMobileView('chat');
  };

  if (loading) {
    return (
      <>
        <div className="scrim" onClick={onClose}/>
        <aside className="drawer" style={{ width: isMobile ? '100%' : 'min(820px,100%)', display: 'grid', placeItems: 'center' }}>
          <div style={{ color: 'var(--ink-3)', fontSize: 14 }}>Učitavam…</div>
        </aside>
      </>
    );
  }

  if (!active) {
    return (
      <>
        <div className="scrim" onClick={onClose}/>
        <aside className="drawer" style={{ width: isMobile ? '100%' : 'min(820px,100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <div style={{ fontSize: 14, color: 'var(--ink-3)' }}>Nema aktivnih razmena.</div>
          <button className="nav-btn" onClick={onClose}>Zatvori</button>
        </aside>
      </>
    );
  }

  return (
    <>
      <div className="scrim" onClick={onClose}/>
      <aside className="drawer" style={{ width: isMobile ? '100%' : 'min(820px,100%)', display: isMobile ? 'flex' : 'grid', flexDirection: 'column', gridTemplateColumns: isMobile ? undefined : '320px 1fr' }}>

        {/* ── MOBILE: lista konverzacija ── */}
        {isMobile && mobileView === 'list' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="dh">
              <h3>Razmene</h3>
              <button className="x-btn" onClick={onClose}><Icon name="x" size={16}/></button>
            </div>
            <div className="db" style={{ flex: 1, overflowY: 'auto' }}>
              {threads.map(t => (
                <div
                  key={t.id}
                  className={'thread' + (t.unread ? ' unread' : '')}
                  onClick={() => openThread(t)}
                >
                  <div className="av">{(t.other_user?.username || 'K').slice(0, 2).toUpperCase()}</div>
                  <div className="tx">
                    <div className="nm">
                      <span>{t.other_user?.username || '—'}</span>
                      <span className="t">{fmtTime(t.last_time)}</span>
                    </div>
                    <div className="pv">{t.last_message || 'Nema poruka'}</div>
                  </div>
                  {t.unread && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }}/>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MOBILE: chat ── */}
        {isMobile && mobileView === 'chat' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#faf8f1' }}>
            <div className="dh" style={{ background: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <button onClick={() => setMobileView('list')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink)', display: 'grid', placeItems: 'center', padding: '4px 8px 4px 0', flexShrink: 0 }}>
                  <Icon name="arrow-l" size={20}/>
                </button>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{active.other_user?.username}</div>
                  {active.listing && (
                    <div style={{ fontSize: 11, color: 'var(--ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{active.listing.title}</div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {active.listing && (
                  <button
                    className="nav-btn"
                    style={{ fontSize: 12, padding: '0 10px', height: 32 }}
                    onClick={() => { onClose(); window.dispatchEvent(new CustomEvent('dj:viewListing', { detail: { id: active.listing.id } })); }}
                  >
                    Oglas
                  </button>
                )}
                <button
                  className="nav-btn"
                  style={{ fontSize: 12, padding: '0 10px', height: 32, color: '#e53e3e', borderColor: '#e53e3e' }}
                  onClick={handleDeleteConversation}
                  title="Obriši chat"
                >
                  <Icon name="trash" size={14}/>
                </button>
              </div>
            </div>
            <div style={{ flex: 1, padding: '14px 16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-3)', margin: 'auto' }}>Započni razgovor…</div>
              )}
              {messages.map(msg => {
                const who = msg.sender === currentUser?.username ? 'me' : 'them';
                return msg.offer
                  ? <OfferCard key={msg.id} msg={msg} who={who} currentUserId={currentUser?.id} onOfferAction={handleOfferAction} isReviewed={reviewedOfferIds.indexOf(msg.offer.id) !== -1}/>
                  : <Bubble key={msg.id} who={who} onDelete={who === 'me' ? () => handleDeleteMessage(msg.id) : null}>{msg.body}</Bubble>;
              })}
              <div ref={bottomRef}/>
            </div>
            <form onSubmit={send} style={{ padding: '10px 12px', borderTop: '1px solid var(--line)', background: '#fff', display: 'flex', gap: 8 }}>
              <input className="input" value={text} onChange={e => setText(e.target.value)} placeholder="Napiši poruku…" style={{ flex: 1 }}/>
              <button className="nav-btn primary" type="submit" disabled={sending}><Icon name="send" size={15}/></button>
            </form>
          </div>
        )}

        {/* ── DESKTOP: originalni dvostupčani layout ── */}
        {!isMobile && (
          <>
        <div style={{ borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column' }}>
          <div className="dh">
            <h3>Poruke</h3>
            <button className="x-btn" onClick={onClose}><Icon name="x" size={16}/></button>
          </div>
          <div className="db">
            {threads.map(t => (
              <div
                key={t.id}
                className={'thread' + (t.unread ? ' unread' : '')}
                onClick={() => openThread(t)}
                style={active.id === t.id ? { background: 'var(--accent-softer)' } : {}}
              >
                <div className="av">{(t.other_user?.username || 'K').slice(0, 2).toUpperCase()}</div>
                <div className="tx">
                  <div className="nm">
                    <span>{t.other_user?.username || '—'}</span>
                    <span className="t">{fmtTime(t.last_time)}</span>
                  </div>
                  <div className="pv">{t.last_message || 'Nema poruka'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, background: '#faf8f1' }}>
          <div className="dh" style={{ background: '#fff' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{active.other_user?.username}</div>
              {active.listing && (
                <div style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                  {active.listing.title}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {active.listing && (
                <button
                  className="nav-btn"
                  onClick={() => window.dispatchEvent(new CustomEvent('dj:viewListing', { detail: { id: active.listing.id } }))}
                >
                  Pogledaj oglas
                </button>
              )}
              <button
                className="nav-btn"
                style={{ color: '#e53e3e', borderColor: '#e53e3e' }}
                onClick={handleDeleteConversation}
                title="Obriši chat"
              >
                <Icon name="trash" size={14}/>
              </button>
            </div>
          </div>

          <div style={{ flex: 1, padding: '18px 22px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-3)', margin: 'auto' }}>
                Započni razgovor…
              </div>
            )}
            {messages.map(msg => {
              const who = msg.sender === currentUser?.username ? 'me' : 'them';
              return msg.offer
                ? <OfferCard
                    key={msg.id}
                    msg={msg}
                    who={who}
                    currentUserId={currentUser?.id}
                    onOfferAction={handleOfferAction}
                    isReviewed={reviewedOfferIds.indexOf(msg.offer.id) !== -1}
                  />
                : <Bubble key={msg.id} who={who}>{msg.body}</Bubble>;
            })}
            <div ref={bottomRef}/>
          </div>

          <form onSubmit={send} style={{ padding: 14, borderTop: '1px solid var(--line)', background: '#fff', display: 'flex', gap: 8 }}>
            <input
              className="input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Napiši poruku…"
              style={{ flex: 1 }}
            />
            <button className="nav-btn primary" type="submit" disabled={sending}>
              <Icon name="send" size={15}/>
            </button>
          </form>
        </div>
          </>
        )}
      </aside>
      {reviewTarget && (
        <ReviewModal
          offer={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </>
  );
}

/* ─── BUBBLE ──────────────────────────────────────── */
function Bubble({ who, children, onDelete }) {
  const me = who === 'me';
  const [hovered, setHovered] = useS(false);
  return (
    <div
      style={{ alignSelf: me ? 'flex-end' : 'flex-start', display: 'flex', alignItems: 'center', gap: 6, maxWidth: '80%' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {me && hovered && onDelete && (
        <button
          onClick={onDelete}
          title="Obriši poruku"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', padding: 2, display: 'grid', placeItems: 'center', borderRadius: 4, flexShrink: 0 }}
        >
          <Icon name="x" size={13}/>
        </button>
      )}
      <div style={{
        background: me ? 'var(--accent)' : '#fff',
        color: me ? '#fff' : 'var(--ink)',
        padding: '10px 14px', borderRadius: 14,
        borderTopRightRadius: me ? 4 : 14,
        borderTopLeftRadius:  me ? 14 : 4,
        fontSize: 14,
        boxShadow: me ? 'none' : '0 1px 2px rgba(0,0,0,.04)',
        border: me ? '0' : '1px solid var(--line)',
      }}>
        {children}
      </div>
    </div>
  );
}

/* ─── PHONE GATE MODAL ────────────────────────────── */
function PhoneGateModal({ onClose, onSaved }) {
  const [phone, setPhone] = useS('');
  const [saving, setSaving] = useS(false);
  const [error, setError] = useS('');

  const handleSave = async () => {
    const clean = phone.trim();
    if (!clean) { setError('Broj telefona je obavezan.'); return; }
    setSaving(true);
    const res = await apiSavePhone(clean);
    setSaving(false);
    if (res.ok) onSaved(clean);
    else setError('Greška pri čuvanju. Pokušaj ponovo.');
  };

  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
        <div className="mh">
          <div className="mt">Ostavi broj telefona</div>
          <button className="mx" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: '20px 24px 24px' }}>
          <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6 }}>
            Broj telefona je neophodan kako bi ostali korisnici mogli da te kontaktiraju. Vidljiv je samo ulogovanim korisnicima.
          </p>
          <input
            className="finput"
            type="tel"
            placeholder="+381 60 123 4567"
            value={phone}
            onChange={e => { setPhone(e.target.value); setError(''); }}
            autoFocus
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
          {error && <div style={{ color: '#dc2626', fontSize: 13, marginTop: 6 }}>{error}</div>}
          <button
            className="nav-btn primary"
            style={{ width: '100%', marginTop: 16, justifyContent: 'center' }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Čuvanje...' : 'Sačuvaj i nastavi'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── PROFILE SCREEN ──────────────────────────────── */
function ProfileScreen({ user: profileData, currentUser, onBack, onOpenItem, onOpenProfile }) {
  const u        = profileData.user || {};
  const listings = profileData.listings || [];
  const reviews  = profileData.reviews  || [];

  const joined = u.joined
    ? new Date(u.joined).toLocaleDateString('sr-Latn-RS', { year: 'numeric', month: 'long' })
    : '';

  const initials = u.username ? u.username.slice(0, 2).toUpperCase() : '??';
  const displayName = u.first_name ? (u.first_name + ' ' + (u.last_name || '')).trim() : u.username;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 24px 60px' }}>
      <button
        onClick={onBack}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 24, padding: 0 }}
      >
        <Icon name="arrow-l" size={14}/> Nazad
      </button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32, flexWrap: 'wrap' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'var(--accent-soft)', color: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, fontWeight: 700, flexShrink: 0,
        }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>
              {displayName}
            </div>
            {u.is_verified && (
              <span title="Verifikovan korisnik" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: '#e6f4ea', color: '#276749', borderRadius: 20, padding: '2px 8px', fontSize: 12, fontWeight: 600 }}>
                <Icon name="check" size={12}/> Verifikovan
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 6, fontSize: 13, color: 'var(--ink-3)' }}>
            {u.city && <span><Icon name="pin" size={13} style={{ verticalAlign: -2, marginRight: 2 }}/>{u.city}</span>}
            {joined && <span>Član od {joined}</span>}
            {u.rating_count > 0 && (
              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
                ★ {parseFloat(u.rating).toFixed(1)} · {u.rating_count} {u.rating_count === 1 ? 'ocena' : 'ocene'}
              </span>
            )}
          </div>
          {currentUser && u.phone && (
            <div style={{ marginTop: 8, fontSize: 14, fontWeight: 500, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="phone" size={14} style={{ color: 'var(--accent)' }}/>
              <a href={'tel:' + u.phone} style={{ color: 'inherit', textDecoration: 'none' }}>{u.phone}</a>
            </div>
          )}
        </div>
      </div>

      {/* Oglasi */}
      {listings.length > 0 && (
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 16, fontFamily: 'var(--font-display)' }}>
            Aktivni oglasi ({listings.length})
          </div>
          <div className="list-grid">
            {listings.map(l => {
              const norm = {
                id: l.id, title: l.title, price: l.price, type: l.listing_type,
                condition: l.condition, city: l.city, images: l.images || [],
                user: u.username, rating: u.rating, seek: l.wants_in_exchange || '',
                cat: l.category ? l.category.slug : '', desc: l.description || '',
                status: l.status,
              };
              return (
                <ListingCard
                  key={l.id}
                  item={norm}
                  onClick={() => onOpenItem(norm)}
                  fav={false}
                  onFav={() => {}}
                  onOpenProfile={onOpenProfile}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Recenzije */}
      {reviews.length > 0 && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 16, fontFamily: 'var(--font-display)' }}>
            Recenzije ({reviews.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {reviews.map((r, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>{r.from_user}</span>
                  <span style={{ color: '#f59e0b', letterSpacing: 1 }}>{'★'.repeat(r.rating)}</span>
                </div>
                {r.comment && <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.5 }}>{r.comment}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {listings.length === 0 && reviews.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-3)', fontSize: 14 }}>
          Ovaj korisnik još nema aktivnih oglasa.
        </div>
      )}
    </div>
  );
}

/* ─── SETTINGS SCREEN ────────────────────── */
function SettingsScreen({ currentUser, onUserUpdated }) {
  const [tab, setTab] = useS('profile');

  // ── Javni profil ──
  const [bio,     setBio]     = useS(currentUser.bio   || '');
  const [city,    setCity]    = useS(currentUser.city  || '');
  const [phone,   setPhone]   = useS(currentUser.phone || '');
  const [saving,  setSaving]  = useS(false);
  const [saveMsg, setSaveMsg] = useS('');
  const [resendSent, setResendSent] = useS(false);
  const [resendErr,  setResendErr]  = useS('');
  const [saveErr, setSaveErr] = useS('');

  // ── Avatar ──
  const avatarRef             = useR(null);
  const [avatarPreview, setAvatarPreview] = useS(currentUser.avatar || null);
  const [avatarUploading, setAvatarUploading] = useS(false);
  const [avatarErr, setAvatarErr] = useS('');

  // ── Lozinka ──
  const [oldPwd,   setOldPwd]   = useS('');
  const [newPwd,   setNewPwd]   = useS('');
  const [confPwd,  setConfPwd]  = useS('');
  const [pwdSaving, setPwdSaving] = useS(false);
  const [pwdMsg,    setPwdMsg]    = useS('');
  const [pwdErr,    setPwdErr]    = useS('');

  const handleSaveProfile = async () => {
    setSaving(true); setSaveMsg(''); setSaveErr('');
    const res = await apiUpdateProfile({ bio, city, phone });
    setSaving(false);
    if (res.ok) {
      onUserUpdated(res.user);
      setSaveMsg('Sačuvano.');
      setTimeout(() => setSaveMsg(''), 3000);
    } else {
      setSaveErr(res.error || 'Greška pri čuvanju.');
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarErr('');
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarUploading(true);
    const res = await apiUploadAvatar(file);
    setAvatarUploading(false);
    if (res.ok) {
      onUserUpdated({ ...currentUser, avatar: res.avatar });
      setAvatarPreview(res.avatar);
    } else {
      setAvatarErr(res.error || 'Greška pri uploadu.');
      setAvatarPreview(currentUser.avatar || null);
    }
  };

  const handleChangePassword = async () => {
    setPwdMsg(''); setPwdErr('');
    if (newPwd !== confPwd) { setPwdErr('Lozinke se ne podudaraju.'); return; }
    if (newPwd.length < 8)  { setPwdErr('Nova lozinka mora imati najmanje 8 karaktera.'); return; }
    setPwdSaving(true);
    const res = await apiChangePassword(oldPwd, newPwd);
    setPwdSaving(false);
    if (res.ok) {
      setOldPwd(''); setNewPwd(''); setConfPwd('');
      setPwdMsg('Lozinka uspešno promenjena.');
      setTimeout(() => setPwdMsg(''), 4000);
    } else {
      setPwdErr(res.error || 'Greška pri promeni lozinke.');
    }
  };

  const initials = currentUser.username ? currentUser.username.slice(0, 2).toUpperCase() : '??';

  const tabStyle = (id) => ({
    padding: '8px 16px',
    fontSize: 14,
    fontWeight: tab === id ? 600 : 400,
    color: tab === id ? 'var(--accent)' : 'var(--ink-3)',
    borderBottom: tab === id ? '2px solid var(--accent)' : '2px solid transparent',
    background: 'none',
    border: 'none',
    borderBottom: tab === id ? '2px solid var(--accent)' : '2px solid transparent',
    cursor: 'pointer',
    transition: 'color .15s',
  });

  const card = { background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: '24px', marginBottom: 20 };
  const label = { fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 };

  return (
    <section className="section" style={{ paddingTop: 32 }}>
      <div className="section-inner" style={{ maxWidth: 640 }}>
        <div className="section-head">
          <div>
            <h2>Podešavanja</h2>
            <div className="sub">Upravljaj nalogom i ličnim podacima</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--line)', marginBottom: 28 }}>
          <button style={tabStyle('profile')} onClick={() => setTab('profile')}>Profil</button>
          <button style={tabStyle('security')} onClick={() => setTab('security')}>Bezbednost</button>
        </div>

        {tab === 'profile' && (
          <div>
            {/* Verifikacija banner */}
            {!currentUser.is_verified && (
              <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 10, padding: '14px 16px', marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <Icon name="alert" size={18} style={{ color: '#b45309', flexShrink: 0, marginTop: 1 }}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#92400e', marginBottom: 4 }}>Email nije verifikovan</div>
                  <div style={{ fontSize: 13, color: '#b45309', lineHeight: 1.5 }}>Verifikuj svoju email adresu kako bi dobio/la oznaku verifikovanog korisnika.</div>
                  {resendSent
                    ? <div style={{ marginTop: 8, fontSize: 13, color: '#276749', fontWeight: 500 }}>Email je poslat na {currentUser.email}</div>
                    : <button
                        onClick={async () => { setResendErr(''); const r = await apiResendVerification(); if (r.ok) setResendSent(true); else setResendErr('Greška. Pokušaj ponovo.'); }}
                        style={{ marginTop: 8, background: 'none', border: '1px solid #b45309', borderRadius: 6, padding: '5px 12px', fontSize: 13, color: '#92400e', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Pošalji verifikacioni email
                      </button>
                  }
                  {resendErr && <div style={{ marginTop: 6, fontSize: 12, color: '#dc2626' }}>{resendErr}</div>}
                </div>
              </div>
            )}

            {/* Avatar */}
            <div style={card}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 16, fontFamily: 'var(--font-display)' }}>
                Profilna slika
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div
                  onClick={() => avatarRef.current && avatarRef.current.click()}
                  style={{
                    width: 72, height: 72, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
                    background: avatarPreview ? 'none' : 'var(--accent-soft)',
                    color: 'var(--accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 26, fontWeight: 700, overflow: 'hidden',
                    border: '2px solid var(--line)',
                    position: 'relative',
                  }}
                >
                  {avatarPreview
                    ? <img src={avatarPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                    : initials
                  }
                  {avatarUploading && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                      <div style={{ width: 20, height: 20, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite' }}/>
                    </div>
                  )}
                </div>
                <div>
                  <button
                    className="nav-btn"
                    onClick={() => avatarRef.current && avatarRef.current.click()}
                    disabled={avatarUploading}
                    style={{ marginBottom: 6 }}
                  >
                    {avatarUploading ? 'Učitavanje...' : 'Promeni sliku'}
                  </button>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>JPG, PNG ili WebP · max 5 MB</div>
                  {avatarErr && <div style={{ color: '#dc2626', fontSize: 13, marginTop: 4 }}>{avatarErr}</div>}
                </div>
              </div>
              <input ref={avatarRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange}/>
            </div>

            {/* Podaci */}
            <div style={card}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 20, fontFamily: 'var(--font-display)' }}>
                Lični podaci
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={label}>Korisničko ime</label>
                <input className="finput" value={currentUser.username} disabled style={{ width: '100%', boxSizing: 'border-box', opacity: .6 }}/>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={label}>Email</label>
                <input className="finput" value={currentUser.email} disabled style={{ width: '100%', boxSizing: 'border-box', opacity: .6 }}/>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={label}>Grad</label>
                <CityPicker value={city} onChange={setCity} className="finput" inputStyle={{ width: '100%', boxSizing: 'border-box' }}/>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={label}>Broj telefona <span style={{ fontWeight: 400, color: 'var(--ink-3)' }}>(vidljiv samo ulogovanim korisnicima)</span></label>
                <input
                  className="finput"
                  type="tel"
                  placeholder="+381 60 123 4567"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={label}>Kratka bio</label>
                <textarea
                  className="finput"
                  placeholder="Nekoliko reči o tebi..."
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={3}
                  style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', minHeight: 80 }}
                />
              </div>

              {saveErr && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 12 }}>{saveErr}</div>}
              {saveMsg && <div style={{ color: '#276749', fontSize: 13, marginBottom: 12 }}>{saveMsg}</div>}

              <button
                className="nav-btn primary"
                onClick={handleSaveProfile}
                disabled={saving}
                style={{ minWidth: 140 }}
              >
                {saving ? 'Čuvanje...' : 'Sačuvaj izmene'}
              </button>
            </div>
          </div>
        )}

        {tab === 'security' && (
          <div style={card}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 20, fontFamily: 'var(--font-display)' }}>
              Promena lozinke
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={label}>Trenutna lozinka</label>
              <input
                className="finput"
                type="password"
                value={oldPwd}
                onChange={e => { setOldPwd(e.target.value); setPwdErr(''); }}
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={label}>Nova lozinka</label>
              <input
                className="finput"
                type="password"
                value={newPwd}
                onChange={e => { setNewPwd(e.target.value); setPwdErr(''); }}
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={label}>Potvrdi novu lozinku</label>
              <input
                className="finput"
                type="password"
                value={confPwd}
                onChange={e => { setConfPwd(e.target.value); setPwdErr(''); }}
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            {pwdErr && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 12 }}>{pwdErr}</div>}
            {pwdMsg && <div style={{ color: '#276749', fontSize: 13, marginBottom: 12 }}>{pwdMsg}</div>}

            <button
              className="nav-btn primary"
              onClick={handleChangePassword}
              disabled={pwdSaving || !oldPwd || !newPwd || !confPwd}
              style={{ minWidth: 180 }}
            >
              {pwdSaving ? 'Menjanje...' : 'Promeni lozinku'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

Object.assign(window, { ListingDetail, PostAdModal, RazmeneDrawer, LoginModal, RegisterModal, EditAdModal, SavedScreen, RatingsScreen, CategoryPickerModal, ProfileScreen, PhoneGateModal, SettingsScreen });
