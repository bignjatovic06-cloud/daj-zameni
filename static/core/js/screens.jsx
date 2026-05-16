const { useState: useS, useEffect: useE, useRef: useR } = React;

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

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Lozinka mora imati najmanje 8 karaktera.'); return; }
    setLoading(true);
    const res = await apiRegister(username, email, password);
    setLoading(false);
    if (res.ok) { onSuccess(res.user); onClose(); }
    else setError(res.error || 'Greška pri registraciji.');
  };

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
  const [msg, setMsg]               = useS('');
  const [loading, setLoading]       = useS(false);
  const [err, setErr]               = useS('');

  useE(() => {
    apiMyListings().then(res => {
      if (Array.isArray(res.results)) setMyListings(res.results);
      else setMyListings([]);
    });
  }, []);

  const submit = async () => {
    if (!selected) return;
    setLoading(true);
    setErr('');
    const res = await apiCreateOffer(item.id, selected.id, msg);
    setLoading(false);
    if (res.ok) { onSuccess(); }
    else setErr(res.error === 'already_offered' ? 'Već si poslao/la ponudu za ovaj oglas.' : 'Greška pri slanju ponude.');
  };

  const condLabel = { new: 'Novo', like_new: 'Kao novo', good: 'Dobro', fair: 'Prihvatljivo', poor: 'Loše' };

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
          ) : myListings.length === 0 ? (
            <div style={{ padding: '20px 16px', background: '#faf8f1', borderRadius: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>📦</div>
              <p style={{ fontWeight: 600, marginBottom: 6 }}>Nemaš aktivnih oglasa</p>
              <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 16 }}>
                Da bi predložio/la razmenu, moraš imati bar jedan aktivan oglas koji nudiš.
              </p>
              <button className="nav-btn primary" onClick={onClose}>Postavi oglas prvo</button>
            </div>
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

              <div className="field-group">
                <label>Poruka (opciono)</label>
                <textarea
                  className="textarea"
                  value={msg}
                  onChange={e => setMsg(e.target.value)}
                  placeholder="Dodaj kratku napomenu uz ponudu…"
                  rows={3}
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

function OfferCard({ msg, who }) {
  const { offer, body } = msg;
  const statusColor = { accepted: 'var(--good)', declined: '#e53e3e', pending: 'var(--ink-3)', pending_owner_response: 'var(--ink-3)', rejected: '#e53e3e', completed: 'var(--good)' };
  const statusLabel = { accepted: '✓ Prihvaćeno', declined: '✗ Odbijeno', pending: '⏳ Na čekanju', pending_owner_response: '⏳ Na čekanju', rejected: '✗ Odbijeno', completed: '✓ Završeno' };
  const me = who === 'me';

  const openListing = () => {
    // Pošiljalac otvara oglas za koji se interesuje (target)
    // Primalac otvara oglas koji mu je ponuđen (offered) + banner
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
function ListingDetail({ item, onBack, onMessage, onEdit, onDelete, categories = [], currentUser = null, onLogin = null, pendingOffer = null, onOfferRespond = null, isSaved = false, onSaveToggle = null }) {
  const [active, setActive]           = useS(0);
  const [statsOpen, setStatsOpen]     = useS(false);
  const [saved, setSaved]             = useS(isSaved);
  const [savePending, setSavePending] = useS(false);
  const [offerSent, setOfferSent]     = useS(false);
  const [showOffer, setShowOffer]     = useS(false);
  const [showReport, setShowReport]   = useS(false);
  const [respondDone, setRespondDone] = useS(null);
  const [respondLoading, setRespondLoading] = useS(false);

  const thumbs      = item.images && item.images.length > 0 ? item.images : [null, null, null, null];
  const catName     = (categories.find(c => c.id === item.cat) || {}).name || item.catName || 'Kategorija';
  const isBarter    = item.type === 'barter' || item.type === 'both';
  const isNew       = item.condition === 'new' || item.condition === 'like_new';
  const priceNum    = item.price ? parseFloat(item.price) : null;
  const isOwner     = currentUser && currentUser.username === item.user;
  const conditionLabel = {
    new: 'Novo', like_new: 'Kao novo', good: 'Dobro', fair: 'Prihvatljivo', poor: 'Loše',
  }[item.condition] || item.condition;

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
              <div className="main">
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
              <p>{item.desc || 'Nema opisa.'}</p>
            </div>

            <div className="specs">
              <div className="r"><span className="k">Stanje</span><span>{conditionLabel}</span></div>
              <div className="r"><span className="k">Kategorija</span><span>{catName}</span></div>
              <div className="r"><span className="k">Lokacija</span><span>{item.city}</span></div>
              <div className="r"><span className="k">Pregledan</span><span>{item.views} puta</span></div>
              <div className="r">
                <span className="k">Šifra oglasa</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>DZ-{String(item.id).slice(-6).toUpperCase()}</span>
              </div>
            </div>
          </div>

          <div className="info">
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              {isBarter && <span className="b" style={{ background: 'var(--accent)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 11, padding: '4px 8px', borderRadius: 6, fontWeight: 700, letterSpacing: '.04em' }}>RAZMENA PRIORITET</span>}
              {isNew    && <span className="b" style={{ background: '#f4d35e', color: '#3b2e00', fontFamily: 'var(--font-mono)', fontSize: 11, padding: '4px 8px', borderRadius: 6, fontWeight: 700, letterSpacing: '.04em' }}>KAO NOVO</span>}
            </div>
            <h1>{item.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ink-3)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
              <Icon name="pin" size={13}/> {item.city}
            </div>
            <div className="pricerow">
              <div className={'price-big' + (isBarter && !priceNum ? ' barter' : '')}>
                {priceNum ? priceNum.toLocaleString('sr-RS') + ' rsd' : 'Razmena'}
              </div>
              {priceNum && <span style={{ color: 'var(--ink-3)', fontSize: 13 }}>· cena dogovorljiva</span>}
            </div>

            {item.seek && (
              <div style={{ padding: '12px 14px', background: 'var(--accent-soft)', borderRadius: 10, fontSize: 14, color: 'var(--ink)', marginTop: 4, marginBottom: 14 }}>
                <b style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.04em' }}>U ZAMENU TRAŽIM</b><br/>
                {item.seek}
              </div>
            )}

            <div className="seller">
              <div className="row">
                <div className="av">{(item.user || 'K').slice(0, 2).toUpperCase()}</div>
                <div style={{ flex: 1 }}>
                  <div className="nm">{item.user}</div>
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
                        <button className="nav-btn primary" onClick={onEdit}>
                          <Icon name="edit" size={15}/> Uredi oglas
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
                    <span>Pregledi</span><b style={{ color: 'var(--ink)' }}>{item.views ?? 0}</b>
                  </div>
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
            <input className="input" value={city} onChange={(e) => setCity(e.target.value)}/>
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

/* ─── POST AD MODAL ──────────────────────────────── */
function PostAdModal({ onClose, categories = [], onCreated }) {
  const [step, setStep]             = useS(1);
  const [type, setType]             = useS('both');
  const [title, setTitle]           = useS('');
  const [cat, setCat]               = useS('');
  const [desc, setDesc]             = useS('');
  const [price, setPrice]           = useS('');
  const [seek, setSeek]             = useS('');
  const [city, setCity]             = useS('Beograd');
  const [imageFiles, setImageFiles] = useS([]);
  const [done, setDone]             = useS(false);
  const [loading, setLoading]       = useS(false);
  const [error, setError]           = useS('');
  const fileInputRef                = useR(null);

  const next = () => setStep(s => Math.min(3, s + 1));
  const prev = () => setStep(s => Math.max(1, s - 1));

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files).slice(0, 4);
    setImageFiles(files);
  };

  const removeImage = (i) => {
    setImageFiles(prev => prev.filter((_, idx) => idx !== i));
  };

  const submit = async () => {
    setError('');
    setLoading(true);

    const res = await apiCreateListing({
      title,
      description:       desc,
      listing_type:      type,
      category:          cat,
      price:             price || null,
      wants_in_exchange: seek,
      city,
      condition:         'good',
    });

    if (!res.ok) {
      setError(res.error || 'Greška pri objavljivanju.');
      setLoading(false);
      return;
    }

    if (imageFiles.length > 0) {
      const imgRes = await apiUploadImages(res.listing.id, imageFiles);
      if (imgRes.ok && imgRes.images) {
        res.listing.images = imgRes.images;
      }
    }

    setLoading(false);
    setDone(true);
    if (onCreated) onCreated(res.listing);
  };

  const catName     = (categories.find(c => c.id === cat) || {}).name || 'opšte';
  const displayCats = categories.filter(c => c.id !== 'sve');

  if (done) {
    return (
      <div className="scrim" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
          <div className="mb" style={{ textAlign: 'center', padding: '40px 32px' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'grid', placeItems: 'center', margin: '0 auto 18px' }}>
              <Icon name="check" size={30} stroke={2.4}/>
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', margin: '0 0 8px', fontSize: 24, letterSpacing: '-0.01em' }}>Oglas je objavljen!</h3>
            <p style={{ color: 'var(--ink-3)', margin: '0 0 22px', fontSize: 14.5 }}>
              Tvoj oglas <b style={{ color: 'var(--ink)' }}>"{title}"</b> je sada vidljiv u kategoriji <b style={{ color: 'var(--ink)' }}>{catName}</b>.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button className="nav-btn" onClick={onClose}>Zatvori</button>
              <button className="nav-btn primary" onClick={onClose}>Pogledaj oglas</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="mh">
          <div>
            <h3>Postavi oglas</h3>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>Korak {step} od 3</div>
          </div>
          <button className="x-btn" onClick={onClose}><Icon name="x" size={16}/></button>
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
                <label>Tip oglasa</label>
                <div className="seg">
                  <button className={type === 'barter' ? 'on' : ''} onClick={() => setType('barter')}>Razmena</button>
                  <button className={type === 'sell'   ? 'on' : ''} onClick={() => setType('sell')}>Prodaja</button>
                  <button className={type === 'both'   ? 'on' : ''} onClick={() => setType('both')}>Oboje</button>
                </div>
              </div>
              <div className="field-group">
                <label>Naziv oglasa</label>
                <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder='npr. Bicikl Capriolo MTB 27.5, malo korišćen' autoFocus/>
                <div className="hint">Budi konkretan. Dobar naziv = više pregleda.</div>
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
                <textarea className="textarea" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Opiši stanje, dimenzije, šta je uključeno…"/>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              {(type === 'sell' || type === 'both') && (
                <div className="field-group">
                  <label>Cena (rsd)</label>
                  <input className="input" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0"/>
                  <div className="hint">Ostavi prazno ako želiš samo razmenu.</div>
                </div>
              )}
              {(type === 'barter' || type === 'both') && (
                <div className="field-group">
                  <label>Šta tražiš u zamenu?</label>
                  <textarea className="textarea" value={seek} onChange={(e) => setSeek(e.target.value)} placeholder="npr. knjige savremene proze, biljke, kućni alat…"/>
                  <div className="hint">Što jasniji opis, to bolja podudarnost.</div>
                </div>
              )}
              <div className="field-group">
                <label>Grad</label>
                <input className="input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="npr. Beograd"/>
              </div>
              <div className="field-group">
                <label>Fotografije</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                  {[0,1,2,3].map(i => {
                    const file = imageFiles[i];
                    const url  = file ? URL.createObjectURL(file) : null;
                    return (
                      <div
                        key={i}
                        onClick={() => fileInputRef.current.click()}
                        style={{
                          aspectRatio: '1/1',
                          border: url ? '2px solid var(--accent)' : '1px dashed var(--ink-4)',
                          borderRadius: 10,
                          display: 'grid',
                          placeItems: 'center',
                          color: 'var(--ink-3)',
                          cursor: 'pointer',
                          background: url ? 'transparent' : '#faf8f1',
                          overflow: 'hidden',
                          position: 'relative',
                        }}
                      >
                        {url ? (
                          <>
                            <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                            {i === 0 && (
                              <span style={{
                                position: 'absolute', bottom: 4, left: 4,
                                background: 'var(--accent)', color: '#fff',
                                fontSize: 9, fontWeight: 700, padding: '2px 5px',
                                borderRadius: 4, fontFamily: 'var(--font-mono)',
                                letterSpacing: '.04em',
                              }}>NASLOVNA</span>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                              style={{
                                position: 'absolute', top: 4, right: 4,
                                width: 20, height: 20, borderRadius: '50%',
                                background: 'rgba(0,0,0,.5)', border: 0,
                                color: '#fff', cursor: 'pointer',
                                display: 'grid', placeItems: 'center', fontSize: 12,
                              }}
                            >×</button>
                          </>
                        ) : (
                          <Icon name={i === 0 ? 'camera' : 'plus'} size={18}/>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="hint">
                  {imageFiles.length > 0
                    ? `${imageFiles.length} ${imageFiles.length === 1 ? 'slika izabrana' : 'slike izabrane'} · klikni za promenu`
                    : 'Klikni da dodaš do 4 fotografije · prva postaje naslovna'
                  }
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div style={{ padding: 16, background: '#faf8f1', borderRadius: 12, fontSize: 14, marginBottom: 14 }}>
                <b style={{ display: 'block', marginBottom: 6, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '.06em' }}>PREGLED</b>
                {imageFiles.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                    {imageFiles.map((f, i) => (
                      <img
                        key={i}
                        src={URL.createObjectURL(f)}
                        style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', border: i === 0 ? '2px solid var(--accent)' : '1px solid var(--line)' }}
                      />
                    ))}
                  </div>
                )}
                <div style={{ fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 4 }}>{title || 'Bez naziva'}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{desc || 'Bez opisa.'}</div>
                <div style={{ marginTop: 10, display: 'flex', gap: 14, fontSize: 12.5, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
                  <span>{catName}</span>
                  <span>{city}</span>
                  <span>{price ? price + ' rsd' : 'Razmena'}</span>
                </div>
                {seek && (
                  <div style={{ marginTop: 8, padding: 8, background: '#fff', borderRadius: 6, fontSize: 13 }}>
                    <b style={{ color: 'var(--accent)' }}>Tražim:</b> {seek}
                  </div>
                )}
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
          <div style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
            {step === 1 && 'Osnovne info'}
            {step === 2 && 'Detalji'}
            {step === 3 && 'Potvrda'}
          </div>
          <button className="nav-btn primary" onClick={step === 3 ? submit : next} disabled={loading}>
            {loading ? 'Objavljujem…' : step === 3 ? 'Objavi oglas' : 'Dalje'}
            {step !== 3 && !loading && <Icon name="arrow-r" size={14} stroke={2}/>}
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
                          {isCompleting ? '…' : '✓ Potvrdi završetak'}
                        </button>
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
  const [threads, setThreads]   = useS([]);
  const [active, setActive]     = useS(null);
  const [messages, setMessages] = useS([]);
  const [text, setText]         = useS('');
  const [loading, setLoading]   = useS(true);
  const [sending, setSending]   = useS(false);
  const bottomRef               = useR(null);
  const activeRef               = useR(null);

  useE(() => { activeRef.current = active; }, [active]);

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
    const iv = setInterval(() => {
      if (!activeRef.current) return;
      apiChatMessages(activeRef.current.id).then(res => {
        if (Array.isArray(res.results)) setMessages(res.results);
      });
    }, 3000);
    return () => clearInterval(iv);
  }, []);

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

  const fmtTime = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <>
        <div className="scrim" onClick={onClose}/>
        <aside className="drawer" style={{ width: 'min(820px,100%)', display: 'grid', placeItems: 'center' }}>
          <div style={{ color: 'var(--ink-3)', fontSize: 14 }}>Učitavam…</div>
        </aside>
      </>
    );
  }

  if (!active) {
    return (
      <>
        <div className="scrim" onClick={onClose}/>
        <aside className="drawer" style={{ width: 'min(820px,100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <div style={{ fontSize: 14, color: 'var(--ink-3)' }}>Nema aktivnih razmena.</div>
          <button className="nav-btn" onClick={onClose}>Zatvori</button>
        </aside>
      </>
    );
  }

  return (
    <>
      <div className="scrim" onClick={onClose}/>
      <aside className="drawer" style={{ width: 'min(820px,100%)', display: 'grid', gridTemplateColumns: '320px 1fr' }}>
        <div style={{ borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column' }}>
          <div className="dh">
            <h3>Razmene</h3>
            <button className="x-btn" onClick={onClose}><Icon name="x" size={16}/></button>
          </div>
          <div className="db">
            {threads.map(t => (
              <div
                key={t.id}
                className={'thread' + (t.unread ? ' unread' : '')}
                onClick={() => { setActive(t); setMessages([]); }}
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
            {active.listing && (
              <button
                className="nav-btn"
                onClick={() => window.dispatchEvent(new CustomEvent('dj:viewListing', { detail: { id: active.listing.id } }))}
              >
                Pogledaj oglas
              </button>
            )}
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
                ? <OfferCard key={msg.id} msg={msg} who={who}/>
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
      </aside>
    </>
  );
}

/* ─── BUBBLE ──────────────────────────────────────── */
function Bubble({ who, children }) {
  const me = who === 'me';
  return (
    <div style={{
      alignSelf: me ? 'flex-end' : 'flex-start',
      background: me ? 'var(--accent)' : '#fff',
      color: me ? '#fff' : 'var(--ink)',
      padding: '10px 14px', borderRadius: 14,
      borderTopRightRadius: me ? 4 : 14,
      borderTopLeftRadius:  me ? 14 : 4,
      maxWidth: '80%', fontSize: 14,
      boxShadow: me ? 'none' : '0 1px 2px rgba(0,0,0,.04)',
      border: me ? '0' : '1px solid var(--line)',
    }}>
      {children}
    </div>
  );
}

Object.assign(window, { ListingDetail, PostAdModal, RazmeneDrawer, LoginModal, RegisterModal, EditAdModal, SavedScreen, RatingsScreen });
