const { useState, useEffect, useRef } = React;

const SERBIAN_CITIES = [
  { id: '',           name: 'Cela Srbija' },
  { id: 'Beograd',    name: 'Beograd' },
  { id: 'Novi Sad',   name: 'Novi Sad' },
  { id: 'Niš',        name: 'Niš' },
  { id: 'Kragujevac', name: 'Kragujevac' },
  { id: 'Subotica',   name: 'Subotica' },
  { id: 'Zrenjanin',  name: 'Zrenjanin' },
  { id: 'Pančevo',    name: 'Pančevo' },
  { id: 'Čačak',      name: 'Čačak' },
  { id: 'Novi Pazar', name: 'Novi Pazar' },
  { id: 'Kraljevo',   name: 'Kraljevo' },
  { id: 'Smederevo',  name: 'Smederevo' },
  { id: 'Leskovac',   name: 'Leskovac' },
  { id: 'Valjevo',    name: 'Valjevo' },
  { id: 'Vranje',     name: 'Vranje' },
  { id: 'Šabac',      name: 'Šabac' },
  { id: 'Užice',      name: 'Užice' },
  { id: 'Požarevac',  name: 'Požarevac' },
  { id: 'Sombor',     name: 'Sombor' },
  { id: 'Kikinda',    name: 'Kikinda' },
];

/* ─── NAV ─────────────────────────────────────── */
function Nav({
  unreadNotifs, unreadThreads,
  currentUser,
  onPostAd, onOpenNotifs, onOpenRazmene, onOpenUser,
  openNotifs, openUser,
  onSearch, onNav,
  onLogin, onLogout,
  onMarkRead,
  onNotifClick,
  notifications,
  categories,
  onSelectCat,
}) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const userRef = useRef(null);

  const initials = currentUser
    ? (currentUser.first_name && currentUser.last_name
        ? (currentUser.first_name[0] + currentUser.last_name[0]).toUpperCase()
        : currentUser.username.slice(0, 2).toUpperCase())
    : '';

  const displayName = currentUser
    ? (currentUser.first_name || currentUser.username)
    : '';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cat) onSelectCat && onSelectCat(cat);
    onSearch(q);
  };

  const handleCatChange = (e) => {
    const val = e.target.value;
    setCat(val);
    onSelectCat && onSelectCat(val || 'sve');
  };

  return (
    <header className="nav">
      <div className="nav-inner">
        <div className="brand" onClick={() => onNav('home')} style={{ cursor: 'pointer' }}>
          <div className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="m7 4 4 4-4 4" /><path d="M3 8h12a4 4 0 0 1 4 4" />
              <path d="m17 20-4-4 4-4" /><path d="M21 16H9a4 4 0 0 1-4-4" />
            </svg>
          </div>
          <span>Daj Zameni</span>
          <small>beta</small>
        </div>

        <form className="nav-search" onSubmit={handleSubmit}>
          <Icon name="search" size={16} stroke={1.8} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Šta tražite ili nudite?"
          />
          <select
            className="s-cat"
            value={cat}
            onChange={handleCatChange}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--ink-2)',
              outline: 'none',
              padding: '0 6px',
              flexShrink: 0,
              maxWidth: 140,
            }}
          >
            <option value="">Sve kategorije</option>
            {(categories || []).filter(c => c.id !== 'sve').map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button type="submit" className="s-btn">Pretraži</button>
        </form>

        <div className="nav-actions">
          <button className="nav-btn primary" onClick={onPostAd}>
            <Icon name="plus" size={15} stroke={2.2} />
            <span>Oglas</span>
          </button>

          {currentUser ? (
            <>
              <div style={{ position: 'relative' }}>
                <button className="nav-btn icon" onClick={onOpenNotifs} aria-label="Obaveštenja">
                  <Icon name="bell" size={17} />
                  {unreadNotifs > 0 && <span className="badge">{unreadNotifs}</span>}
                </button>
                {openNotifs && (
                  <NotificationsPopover
                    notifications={notifications || []}
                    onMarkRead={onMarkRead}
                    onNotifClick={onNotifClick}
                  />
                )}
              </div>

              <button className="nav-btn" onClick={onOpenRazmene}>
                <Icon name="swap" size={16} />
                <span>Razmene</span>
                {unreadThreads > 0 && (
                  <span style={{
                    background: 'var(--accent)', color: '#fff', fontSize: 10,
                    fontWeight: 700, padding: '1px 6px', borderRadius: 8,
                    fontFamily: 'var(--font-mono)',
                  }}>
                    {unreadThreads}
                  </span>
                )}
              </button>

              <div style={{ position: 'relative' }} ref={userRef}>
                <button className="user-chip" onClick={onOpenUser}>
                  <span className="avatar">{initials}</span>
                  <span style={{ fontWeight: 600 }}>{displayName}</span>
                  <Icon name="caret" size={11} className="caret" />
                </button>
                {openUser && (
                  <div className="menu" role="menu">
                    <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid var(--line)' }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{currentUser.username}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 1 }}>{currentUser.email}</div>
                    </div>
                    <div className="item" onClick={() => { onNav && onNav('my-listings'); }}>
                      <Icon name="tag" size={15} /> Moji oglasi
                    </div>
                    <div className="item" onClick={() => { onNav && onNav('saved'); }}>
                      <Icon name="heart" size={15} /> Sačuvano
                    </div>
                    <div className="item" onClick={() => { onNav && onNav('ratings'); }}>
                      <Icon name="star" size={15} /> Ocene i istorija
                    </div>
                    <div className="item" onClick={() => { onNav && onNav('settings'); }}>
                      <Icon name="sliders" size={15} /> Podešavanja
                    </div>
                    <div className="sep" />
                    <div className="item danger" onClick={onLogout}>
                      <Icon name="logout" size={15} /> Odjava
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button className="nav-btn" onClick={onLogin} style={{ fontWeight: 600 }}>
              <Icon name="user" size={15} />
              <span>Prijava</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

/* ─── NOTIFICATIONS POPOVER ──────────────────── */
function NotificationsPopover({ notifications = [], onMarkRead, onNotifClick }) {
  const fmtTime = (iso) => {
    if (!iso) return '';
    const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (diff < 60)    return 'upravo';
    if (diff < 3600)  return Math.floor(diff / 60) + ' min';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h';
    return Math.floor(diff / 86400) + 'd';
  };

  const typeIcon = (type) => {
    if (type === 'offer' || type === 'offer_accepted' || type === 'offer_declined') return 'swap';
    if (type === 'message') return 'msg';
    return 'bell';
  };

  return (
    <div className="pop" role="dialog" aria-label="Obaveštenja">
      <div className="ph">
        <h4>Obaveštenja</h4>
        {notifications.some(n => !n.is_read) && (
          <button onClick={onMarkRead}>Označi sve kao pročitano</button>
        )}
      </div>
      <div className="pl">
        {notifications.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
            Nema novih obaveštenja
          </div>
        ) : notifications.map((n) =>
          <div
            key={n.id}
            className={'notif' + (!n.is_read ? ' unread' : '')}
            onClick={() => onNotifClick && onNotifClick(n)}
            style={{ cursor: onNotifClick ? 'pointer' : 'default' }}
          >
            <div className="ni"><Icon name={typeIcon(n.type)} size={16} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="nt">{n.text}</div>
              <div className="ntime">{fmtTime(n.created_at)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── HERO ─────────────────────────────────────── */
function Hero({ layout, accent, onSearch, onPostAd, onCityChange }) {
  const [q, setQ] = useState('');
  const [city, setCity] = useState('');
  const [radius, setRadius] = useState(10);
  const [showPicker, setShowPicker] = useState(false);
  const locRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (locRef.current && !locRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const cityLabel = city ? (city + ' · ' + radius + ' km') : 'Cela Srbija';

  const applyLocation = (c, r) => {
    onCityChange && onCityChange(c, r);
    setShowPicker(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCityChange && onCityChange(city, radius);
    onSearch(q);
  };

  return (
    <section className={'hero layout-' + layout}>
      <div className="hero-inner">
        <div>
          <h1>
            Daj što ne <em>koristiš</em>.<br />
            <span className="amp">—</span> Uzmi što ti <em>treba</em>.
          </h1>
          <p className="lede">
            Poveži se sa ljudima na drugačiji način. Razmeni, kupi ili prodaj predmete — bez agencija, bez naknada, bez komplikacija.
          </p>

          <form className="hero-search" onSubmit={handleSubmit}>
            <div className="field">
              <Icon name="search" size={18} stroke={1.8} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Šta tražite ili nudite?"
              />
            </div>
            <div className="divider" />

            <div
              className="loc"
              ref={locRef}
              style={{ position: 'relative', cursor: 'pointer', userSelect: 'none' }}
              onClick={() => setShowPicker(p => !p)}
            >
              <Icon name="pin" size={16} />
              <span>{cityLabel}</span>
              <Icon name="caret" size={11} style={{ color: 'var(--ink-3)' }} />

              {showPicker && (
                <div
                  onClick={e => e.stopPropagation()}
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    left: 0,
                    background: 'var(--bg, #fff)',
                    border: '1px solid var(--line, #e5e7eb)',
                    borderRadius: 12,
                    padding: 16,
                    minWidth: 230,
                    boxShadow: '0 8px 28px rgba(0,0,0,0.13)',
                    zIndex: 200,
                  }}
                >
                  <div style={{ marginBottom: 12 }}>
                    <label style={{
                      display: 'block', fontSize: 11, fontWeight: 700,
                      letterSpacing: '0.06em', color: 'var(--ink-3)', marginBottom: 6,
                      textTransform: 'uppercase',
                    }}>
                      Grad
                    </label>
                    <select
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      style={{
                        width: '100%', padding: '8px 10px',
                        borderRadius: 8, border: '1px solid var(--line, #e5e7eb)',
                        fontSize: 14, color: 'var(--ink-1)', background: 'var(--bg, #fff)',
                        cursor: 'pointer', outline: 'none',
                      }}
                    >
                      {SERBIAN_CITIES.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {city && (
                    <div style={{ marginBottom: 12 }}>
                      <label style={{
                        display: 'block', fontSize: 11, fontWeight: 700,
                        letterSpacing: '0.06em', color: 'var(--ink-3)', marginBottom: 8,
                        textTransform: 'uppercase',
                      }}>
                        Razdaljina
                      </label>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {[5, 10, 25, 50].map(r => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setRadius(r)}
                            style={{
                              flex: 1, padding: '7px 4px',
                              borderRadius: 8,
                              border: '1.5px solid ' + (radius === r ? 'var(--accent)' : 'var(--line, #e5e7eb)'),
                              background: radius === r ? 'var(--accent)' : 'transparent',
                              color: radius === r ? '#fff' : 'var(--ink-1)',
                              fontSize: 12, fontWeight: 600, cursor: 'pointer',
                              transition: 'all .15s',
                            }}
                          >
                            {r} km
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8 }}>
                    {city && (
                      <button
                        type="button"
                        onClick={() => { setCity(''); applyLocation('', radius); }}
                        style={{
                          flex: 1, padding: '8px', borderRadius: 8,
                          border: '1px solid var(--line)', background: 'transparent',
                          color: 'var(--ink-2)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                        }}
                      >
                        Resetuj
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => applyLocation(city, radius)}
                      style={{
                        flex: 2, padding: '8px', borderRadius: 8,
                        background: 'var(--accent)', color: '#fff',
                        border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      Primeni
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button className="go" type="submit">
              <Icon name="search" size={15} stroke={2.2} /> Pretraži
            </button>
          </form>

          <div className="hero-tags">
            {['Knjige', 'Bicikl', 'Nameštaj', 'Slušalice', 'Dečija oprema', 'Biljke'].map((tag) =>
              <span key={tag} className="hero-tag" onClick={() => onSearch(tag)}>{tag}</span>
            )}
          </div>
        </div>

        {layout === 'split' && <HeroArt accent={accent} />}
      </div>

      {layout === 'grid' &&
        <div className="section-inner" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 24px' }}>
          <div className="hero-grid-strip">
            {[1,2,3,4,5,6].map((i) =>
              <div key={i} className="hgs">slika {i}</div>
            )}
          </div>
        </div>
      }
    </section>
  );
}

/* ─── TRUST STRIP ──────────────────────────────── */
function TrustStrip() {
  return (
    <div className="trust">
      <div className="trust-inner">
        <div className="t-i"><Icon name="shield" size={16} style={{ color: 'var(--accent)' }} /> <span><b>Verifikovani profili</b> — broj telefona obavezan</span></div>
        <div className="t-i"><Icon name="leaf"   size={16} style={{ color: 'var(--accent)' }} /> <span><b>23.840 razmena</b> ostvareno ove godine</span></div>
        <div className="t-i"><Icon name="star"   size={16} style={{ color: 'var(--accent)' }} /> <span><b>4.8/5</b> prosečna ocena zajednice</span></div>
        <div className="t-i"><Icon name="pin"    size={16} style={{ color: 'var(--accent)' }} /> <span><b>72 grada</b> u Srbiji aktivno</span></div>
      </div>
    </div>
  );
}

/* ─── CATEGORIES ─────────────────────────────────── */
function Categories({ categories = [], onSelect }) {
  const displayCats = categories.filter(c => c.id !== 'sve');
  return (
    <section className="section">
      <div className="section-inner">
        <div className="section-head">
          <div>
            <h2>Pregledaj po kategoriji</h2>
            <div className="sub">
              {displayCats.reduce((s, c) => s + (c.count || 0), 0).toLocaleString()} aktivnih oglasa danas.
            </div>
          </div>
          <div className="link" onClick={() => onSelect('sve')}>
            Sve kategorije <Icon name="arrow-r" size={14} />
          </div>
        </div>
        <div className="cat-grid">
          {displayCats.length === 0 ? (
            <div style={{ gridColumn: '1/-1', padding: '32px 0', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
              Učitavanje kategorija...
            </div>
          ) : displayCats.map((c) =>
            <div key={c.id} className="cat-tile" onClick={() => onSelect(c.id)}>
              <div className="ic"><Icon name={c.icon || 'tag'} size={22} stroke={1.5} /></div>
              <div>
                <div className="nm">{c.name}</div>
                <div className="ct">{c.count || 0} oglasa</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ─── LISTING CARD ─────────────────────────────── */
function relTime(iso) {
  if (!iso) return '';
  var diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 3600)       return Math.floor(diff / 60) + ' min';
  if (diff < 86400)      return Math.floor(diff / 3600) + ' h';
  if (diff < 86400 * 30) return 'prije ' + Math.floor(diff / 86400) + ' d';
  return 'prije ' + Math.floor(diff / (86400 * 30)) + ' mj';
}

function ListingCard({ item, fav, onFav, onClick }) {
  const isBarter  = item.type === 'barter' || item.type === 'both';
  const isPremium = item.is_premium || item.is_featured;

  return (
    <div className="card" onClick={onClick}>
      <div className="img">
        <div className="ph">
          {item.images && item.images.length > 0
            ? <img
                src={item.images[0].url}
                alt={item.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                loading="lazy"
              />
            : <span style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', textAlign: 'center', padding: '0 8px' }}>
                {item.catName || '📦'}
              </span>
          }
        </div>
        <div className="badges">
          {isPremium && (
            <span className="b" style={{ background: '#1a365d', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 10, padding: '3px 7px', borderRadius: 5, fontWeight: 700, letterSpacing: '.05em' }}>
              ★ PREMIUM
            </span>
          )}
          {isBarter && <span className="b barter"><Icon name="swap" size={10} stroke={2}/> Razmena</span>}
        </div>
        <button
          className={'fav' + (fav ? ' on' : '')}
          onClick={(e) => { e.stopPropagation(); onFav(); }}
          aria-label="Sačuvaj"
        >
          <Icon name="heart" size={15} />
        </button>
      </div>
      <div className="body">
        <div className="title">{item.title}</div>
        {item.seek && (
          <div style={{ fontSize: 12, color: 'var(--ink-3)', fontStyle: 'italic', marginBottom: 2 }}>↳ {item.seek}</div>
        )}
        <div className="price">
          <span className={'p' + (isBarter && !item.price ? ' barter' : '')}>
            {item.price
              ? parseFloat(item.price).toLocaleString('sr-RS') + ' RSD'
              : 'Razmena'}
          </span>
        </div>
        <div className="meta" style={{ marginTop: 4 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Icon name="pin" size={11}/> {item.city}
          </span>
          <span style={{ color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{relTime(item.created)}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── HOW IT WORKS ─────────────────────────────── */
function HowItWorks() {
  const steps = [
    { n: '01', t: 'Postavi oglas',  p: 'Slikaj predmet, opiši ga i naznači da li tražiš razmenu, novac ili oboje. Postavljanje traje manje od minuta.' },
    { n: '02', t: 'Razmeni poruke', p: 'Korisnici ti pišu direktno. Bez agencija i posrednika — dogovaraš se sa osobom koja je zainteresovana.' },
    { n: '03', t: 'Završi razmenu', p: 'Nađite se uživo, predaj predmet, oceni iskustvo. Vaše ocene grade poverenje u zajednici.' },
  ];
  return (
    <section className="section">
      <div className="section-inner">
        <div className="section-head">
          <div>
            <h2>Kako funkcioniše</h2>
            <div className="sub">Tri koraka. Bez registracije sa karticom, bez pretplata, bez provizija.</div>
          </div>
        </div>
        <div className="how">
          {steps.map((s) =>
            <div key={s.n} className="step">
              <div className="num">{s.n}</div>
              <h3>{s.t}</h3>
              <p>{s.p}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ─── FOOTER ───────────────────────────────────── */
function Footer() {
  return (
    <footer className="foot">
      <div className="foot-inner">
        <div>© 2026 Daj Zameni · Made in Serbia</div>
        <div className="links">
          <a>O nama</a><a>Pravila zajednice</a><a>Privatnost</a><a>Pomoć</a><a>Kontakt</a>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, {
  Nav, Hero, TrustStrip, Categories,
  ListingCard, HowItWorks, Footer,
  NotificationsPopover,
});