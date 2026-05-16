function normalizeListings(apiListings) {
  return apiListings.map(l => ({
    id:         l.id,
    title:      l.title,
    price:      l.price,
    type:       l.listing_type,
    condition:  l.condition,
    status:     l.status,
    city:       l.city,
    views:      l.views,
    is_featured: l.is_featured || false,
    is_premium:  l.is_premium  || false,
    cat:        l.category ? l.category.slug : '',
    catName:    l.category ? l.category.name : '',
    user:       l.user ? l.user.username : '',
    rating:     l.user ? l.user.rating : 0,
    seek:       l.wants_in_exchange || '',
    created:    l.created_at,
    images:     l.images || [],
    desc:       l.description || '',
  }));
}

function normalizeCategories(apiCats) {
  return apiCats.map(c => ({
    id:       c.slug,
    slug:     c.slug,
    name:     c.name,
    icon:     c.icon,
    tint:     c.tint,
    count:    c.count,
    children: (c.children || []).map(s => ({
      id:    s.slug,
      slug:  s.slug,
      name:  s.name,
      icon:  s.icon,
      count: s.count,
    })),
  }));
}

const { useState: uS, useEffect: uE, useMemo, useRef: uR } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#0d6e6f",
  "fontPair": "inter",
  "heroLayout": "split"
}/*EDITMODE-END*/;

const FONT_PAIRS = {
  inter:    { display: '"Inter Tight", ui-sans-serif, system-ui, sans-serif', ui: '"Inter", ui-sans-serif, system-ui, sans-serif', label: 'Inter Tight + Inter' },
  manrope:  { display: '"Manrope", ui-sans-serif, system-ui, sans-serif',     ui: '"Manrope", ui-sans-serif, system-ui, sans-serif', label: 'Manrope' },
  jakarta:  { display: '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif', ui: '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif', label: 'Plus Jakarta' },
  fraunces: { display: '"Fraunces", ui-serif, Georgia, serif',                ui: '"Inter", ui-sans-serif, system-ui, sans-serif', label: 'Fraunces + Inter' },
  geist:    { display: '"Geist", ui-sans-serif, system-ui, sans-serif',       ui: '"Geist", ui-sans-serif, system-ui, sans-serif', label: 'Geist' },
};

const ACCENTS = [
  { id: 'teal',  value: '#0d6e6f' },
  { id: 'olive', value: '#5a6b2a' },
  { id: 'rust',  value: '#b8590a' },
  { id: 'navy',  value: '#1e3a5f' },
  { id: 'plum',  value: '#6b2a5e' },
  { id: 'slate', value: '#374151' },
];

const FILTER_CHIPS = [
  { id: 'sve',      label: 'Sve'       },
  { id: 'barter',   label: 'Razmena'   },
  { id: 'sell',     label: 'Prodaja'   },
  { id: 'newest',   label: 'Najnovije' },
  { id: 'with_img', label: 'Sa slikom' },
];

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const [view, setView]                   = uS('home');
  const [selectedItem, setSelectedItem]   = uS(null);
  const [filterCat, setFilterCat]         = uS('sve');
  const [filterChip, setFilterChip]       = uS('sve');
  const [searchQuery, setSearchQuery]     = uS('');
  const [filterCity, setFilterCity]       = uS('');
  const [filterRadius, setFilterRadius]   = uS(10);
  const [filterConditions, setFilterConditions] = uS([]);
  const [filterMaxPrice, setFilterMaxPrice]     = uS(300000);
  const [filterBarter, setFilterBarter]         = uS(false);
  const [filterPremium, setFilterPremium]       = uS(false);
  const [filterSort, setFilterSort]             = uS('newest');
  const [catPickerOpen, setCatPickerOpen]       = uS(false);

  const [favPending, setFavPending]       = uS({});
  const [postOpen, setPostOpen]           = uS(false);
  const [razmeneOpen, setRazmeneOpen]     = uS(false);
  const [messageTarget, setMessageTarget] = uS(null);
  const [notifsOpen, setNotifsOpen]       = uS(false);
  const [userOpen, setUserOpen]           = uS(false);
  const [loginOpen, setLoginOpen]         = uS(false);
  const [registerOpen, setRegisterOpen]   = uS(false);
  const [editItem, setEditItem]           = uS(null);
  const [deleteConfirm, setDeleteConfirm] = uS(false);
  const [pendingOffer, setPendingOffer]   = uS(null);

  const [listings, setListings]           = uS([]);
  const [categories, setCategories]       = uS([]);
  const [currentUser, setCurrentUser]     = uS(null);
  const [notifications, setNotifications] = uS([]);
  const [wishlistIds, setWishlistIds]     = uS({});
  const [loading, setLoading]             = uS(true);
  const [apiError, setApiError]           = uS(null);

  const unreadNotifs  = notifications.filter(n => !n.is_read).length;
  const unreadThreads = 0;

  uE(() => {
    Promise.all([
      apiAuthStatus(),
      apiListings(),
      apiCategories(),
    ]).then(([auth, listData, catData]) => {
      if (auth.authenticated) {
        setCurrentUser(auth.user);
        apiNotifications().then(res => {
          if (res.ok && res.results) setNotifications(res.results);
        });
        apiWishlistIds().then(res => {
          if (res.ids) {
            const map = {};
            res.ids.forEach(id => { map[id] = true; });
            setWishlistIds(map);
          }
        });
      }
      setListings(normalizeListings(listData.results || []));
      setCategories([
        { id: 'sve', slug: 'sve', name: 'Sve kategorije', icon: 'grid', count: listData.count || 0, children: [] },
        ...normalizeCategories(catData.results || []),
      ]);
      setLoading(false);
    }).catch(err => {
      console.error('API greška:', err);
      setApiError('Nije moguće učitati podatke. Provjeri da li server radi.');
      setLoading(false);
    });
  }, []);

  uE(() => {
    const r = document.documentElement;
    r.style.setProperty('--accent', t.accent);
    r.style.setProperty('--accent-soft',   'color-mix(in oklab, ' + t.accent + ' 12%, #fff)');
    r.style.setProperty('--accent-softer', 'color-mix(in oklab, ' + t.accent + ' 6%, #fff)');
    const pair = FONT_PAIRS[t.fontPair] || FONT_PAIRS.inter;
    r.style.setProperty('--font-display', pair.display);
    r.style.setProperty('--font-ui',      pair.ui);
  }, [t.accent, t.fontPair]);

  uE(() => {
    if (!notifsOpen && !userOpen) return;
    const onClick = (e) => {
      if (!e.target.closest('.pop') && !e.target.closest('.menu') && !e.target.closest('button')) {
        setNotifsOpen(false);
        setUserOpen(false);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [notifsOpen, userOpen]);

  uE(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if      (deleteConfirm)     setDeleteConfirm(false);
      else if (editItem)          setEditItem(null);
      else if (loginOpen)         setLoginOpen(false);
      else if (registerOpen)      setRegisterOpen(false);
      else if (postOpen)          setPostOpen(false);
      else if (razmeneOpen)       setRazmeneOpen(false);
      else if (notifsOpen)        setNotifsOpen(false);
      else if (userOpen)          setUserOpen(false);
      else if (view === 'detail') { setView('home'); setPendingOffer(null); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  uE(() => {
    if (!notifsOpen || unreadNotifs === 0) return;
    apiMarkNotificationsRead().then(() => {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    });
  }, [notifsOpen]);

  uE(() => {
    const handler = (e) => {
      const { id, offer, senderUsername } = e.detail;
      const item = listings.find(l => String(l.id) === String(id));
      if (item) {
        setRazmeneOpen(false);
        setMessageTarget(null);
        setPendingOffer(offer ? { offer, senderUsername } : null);
        setSelectedItem(item);
        setView('detail');
        window.scrollTo({ top: 0 });
      }
    };
    window.addEventListener('dj:viewListing', handler);
    return () => window.removeEventListener('dj:viewListing', handler);
  }, [listings]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setLoginOpen(false);
    setRegisterOpen(false);
    apiNotifications().then(res => {
      if (res.ok && res.results) setNotifications(res.results);
    });
    apiWishlistIds().then(res => {
      if (res.ids) {
        const map = {};
        res.ids.forEach(id => { map[id] = true; });
        setWishlistIds(map);
      }
    });
  };

  const handleLogout = async () => {
    await apiLogout();
    setCurrentUser(null);
    setNotifications([]);
    setWishlistIds({});
    setUserOpen(false);
  };

  const handleSaveToggle = (id, saved) => {
    setWishlistIds(prev => {
      const next = Object.assign({}, prev);
      if (saved) next[id] = true;
      else delete next[id];
      return next;
    });
  };

  const handleMarkRead = async () => {
    await apiMarkNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const handleNotifClick = (notif) => {
    setNotifsOpen(false);
    setMessageTarget(null);
    setRazmeneOpen(true);
  };

  const requireAuth = (action) => {
    if (currentUser) action();
    else setLoginOpen(true);
  };

  const handleOfferRespond = async (offerId, action) => {
    const res = await apiRespondToOffer(offerId, action);
    if (res.ok) setPendingOffer(null);
  };

  const filtered = useMemo(() => {
    let out = listings;

    if (filterCat !== 'sve') {
      const cat = categories.find(c => c.id === filterCat);
      if (cat && cat.children && cat.children.length > 0) {
        const childIds = new Set(cat.children.map(s => s.id));
        out = out.filter(l => l.cat === filterCat || childIds.has(l.cat));
      } else {
        out = out.filter(l => l.cat === filterCat);
      }
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      out = out.filter(l =>
        (l.title + ' ' + (l.seek || '') + ' ' + (l.city || '')).toLowerCase().includes(q)
      );
    }

    if (filterChip === 'barter') {
      out = out.filter(l => l.type === 'barter' || l.type === 'both');
    } else if (filterChip === 'sell') {
      out = out.filter(l => l.type === 'sell' || l.type === 'both');
    } else if (filterChip === 'with_img') {
      out = out.filter(l => l.images && l.images.length > 0);
    }

    if (filterCity) {
      out = out.filter(l =>
        l.city && l.city.toLowerCase().includes(filterCity.toLowerCase())
      );
    }

    if (filterBarter) {
      out = out.filter(l => l.type === 'barter' || l.type === 'both');
    }

    if (filterPremium) {
      out = out.filter(l => l.is_premium || l.is_featured);
    }

    if (filterConditions.length > 0) {
      out = out.filter(l => filterConditions.includes(l.condition));
    }

    if (filterMaxPrice < 300000) {
      out = out.filter(l => !l.price || parseFloat(l.price) <= filterMaxPrice);
    }

    if (filterChip === 'newest' || filterSort === 'newest') {
      out = [...out].sort((a, b) => new Date(b.created) - new Date(a.created));
    } else if (filterSort === 'price_asc') {
      out = [...out].sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
    } else if (filterSort === 'price_desc') {
      out = [...out].sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
    }

    return out;
  }, [listings, filterCat, searchQuery, filterChip, filterCity, filterBarter, filterPremium, filterConditions, filterMaxPrice, filterSort, categories]);

  const resetFilters = () => {
    setFilterBarter(false);
    setFilterPremium(false);
    setFilterCity('');
    setFilterConditions([]);
    setFilterMaxPrice(300000);
    setFilterCat('sve');
    setFilterSort('newest');
  };

  const hasActiveFilters = filterBarter || filterPremium || filterCity || filterConditions.length > 0 || filterMaxPrice < 300000 || filterCat !== 'sve';

  const onSearch = (q) => {
    setSearchQuery(q);
    setFilterChip('sve');
    setView('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSelectCat = (id) => {
    setFilterCat(id);
    setFilterChip('sve');
    setView('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onOpenItem = (item) => {
    setSelectedItem(item);
    setView('detail');
    window.scrollTo({ top: 0 });
  };

  const toggleFav = async (id) => {
    if (!currentUser) { setLoginOpen(true); return; }
    if (favPending[id]) return;
    setFavPending(p => Object.assign({}, p, { [id]: true }));
    const res = await apiToggleWishlist(id);
    if (res.ok) handleSaveToggle(id, res.saved);
    setFavPending(p => { const n = Object.assign({}, p); delete n[id]; return n; });
  };

  const onCreatedListing = (newListing) => {
    if (!newListing) return;
    const [normalized] = normalizeListings([newListing]);
    setListings(prev => [normalized, ...prev]);
    apiCategories().then(catData => {
      if (catData && catData.results) {
        setCategories([
          { id: 'sve', slug: 'sve', name: 'Sve kategorije', icon: 'grid', tint: '', count: 0, children: [] },
          ...normalizeCategories(catData.results),
        ]);
      }
    });
  };

  const handleDelete = async () => {
    await apiDeleteListing(selectedItem.id);
    setListings(prev => prev.filter(l => l.id !== selectedItem.id));
    setDeleteConfirm(false);
    setView('home');
  };

  if (loading) return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16,
      background: 'var(--bg)', color: 'var(--ink-3)', fontFamily: 'var(--font-ui)',
    }}>
      <div style={{
        width: 40, height: 40, border: '3px solid var(--line)',
        borderTopColor: 'var(--accent)', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}/>
      <style>{'@keyframes spin { to { transform: rotate(360deg) } }'}</style>
      <div style={{ fontSize: 14 }}>Učitavanje...</div>
    </div>
  );

  if (apiError) return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 12,
      background: 'var(--bg)', color: 'var(--ink-2)',
      fontFamily: 'var(--font-ui)', padding: 24, textAlign: 'center',
    }}>
      <div style={{ fontSize: 32 }}>⚠️</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>Greška pri učitavanju</div>
      <div style={{ fontSize: 14, maxWidth: 360 }}>{apiError}</div>
      <button className="nav-btn primary" style={{ marginTop: 8 }} onClick={() => window.location.reload()}>
        Pokušaj ponovo
      </button>
    </div>
  );

  const myListings = listings.filter(l => l.user === currentUser?.username);
  const VIEW_LABELS = { saved: 'Sačuvani oglasi', ratings: 'Ocene i istorija', settings: 'Podešavanja' };
  const activeCat = categories.find(c => c.id === filterCat);

  return (
    <div className="app" data-screen-label="01 Daj Zameni — Home">
      <Nav
        notifications={notifications}
        unreadNotifs={unreadNotifs}
        unreadThreads={unreadThreads}
        currentUser={currentUser}
        onPostAd={() => requireAuth(() => setPostOpen(true))}
        onOpenNotifs={(e) => { e.stopPropagation(); setUserOpen(false); setNotifsOpen(v => !v); }}
        onOpenRazmene={() => requireAuth(() => { setMessageTarget(null); setRazmeneOpen(true); })}
        onOpenUser={(e) => { e.stopPropagation(); setNotifsOpen(false); setUserOpen(v => !v); }}
        openNotifs={notifsOpen}
        openUser={userOpen}
        onSearch={onSearch}
        onNav={(v) => { setView(v); setSearchQuery(''); setFilterCat('sve'); setFilterChip('sve'); setUserOpen(false); }}
        onLogin={() => setLoginOpen(true)}
        onLogout={handleLogout}
        onMarkRead={handleMarkRead}
        onNotifClick={handleNotifClick}
        categories={categories}
        onSelectCat={onSelectCat}
      />

      {view === 'home' && (
        <>
          <Hero
            layout={t.heroLayout}
            accent={t.accent}
            onSearch={onSearch}
            onPostAd={() => requireAuth(() => setPostOpen(true))}
            onCityChange={(city, radius) => {
              setFilterCity(city);
              setFilterRadius(radius);
            }}
          />
          <TrustStrip/>
          <Categories categories={categories} onSelect={onSelectCat}/>
          <section className="section" data-screen-label="01b Featured listings">
            <div className="section-inner">
              <div className="section-head">
                <div>
                  <h2>Najnoviji oglasi u tvojoj okolini</h2>
                  <div className="sub">{listings.length} oglasa · sortirano po datumu</div>
                </div>
                <div className="link" onClick={() => onSelectCat('sve')}>
                  Pogledaj sve <Icon name="arrow-r" size={14}/>
                </div>
              </div>
              {listings.length === 0 ? (
                <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--ink-3)', fontSize: 14 }}>
                  Još nema oglasa. Budi prvi!<br/>
                  <button className="nav-btn primary" style={{ marginTop: 14 }} onClick={() => requireAuth(() => setPostOpen(true))}>
                    <Icon name="plus" size={14}/> Postavi oglas
                  </button>
                </div>
              ) : (
                <div className="list-grid">
                  {listings.slice(0, 8).map(l => (
                    <ListingCard key={l.id} item={l} fav={!!wishlistIds[l.id]} onFav={() => toggleFav(l.id)} onClick={() => onOpenItem(l)}/>
                  ))}
                </div>
              )}
            </div>
          </section>
          <HowItWorks/>
          <Footer/>
        </>
      )}

      {view === 'search' && (
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 24px 60px', display: 'grid', gridTemplateColumns: '268px 1fr', gap: 28, alignItems: 'start' }}>

          <aside style={{ position: 'sticky', top: 80 }}>

            <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 12, padding: '16px', marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', color: 'var(--ink-3)', marginBottom: 10, textTransform: 'uppercase' }}>Kategorija</div>
              <button
                onClick={() => setCatPickerOpen(true)}
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: 8,
                  border: '1px solid ' + (filterCat !== 'sve' ? 'var(--accent)' : 'var(--line)'),
                  background: filterCat !== 'sve' ? 'var(--accent-soft)' : '#faf8f1',
                  fontSize: 13, color: filterCat !== 'sve' ? 'var(--accent)' : 'var(--ink-2)',
                  cursor: 'pointer', fontWeight: filterCat !== 'sve' ? 600 : 400,
                  display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left',
                }}
              >
                <Icon name="grid" size={14}/>
                <span style={{ flex: 1 }}>
                  {filterCat !== 'sve' ? (activeCat ? activeCat.name : filterCat) : 'Izaberi kategoriju'}
                </span>
                {filterCat !== 'sve' && (
                  <span
                    onClick={e => { e.stopPropagation(); setFilterCat('sve'); }}
                    style={{ color: 'var(--accent)', fontSize: 16, lineHeight: 1, fontWeight: 700 }}
                  >×</span>
                )}
              </button>
              {activeCat && activeCat.children && activeCat.children.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {activeCat.children.map(s => (
                    <span
                      key={s.id}
                      onClick={() => setFilterCat(s.id)}
                      style={{
                        fontSize: 11, padding: '3px 8px', borderRadius: 6, cursor: 'pointer',
                        border: '1px solid ' + (filterCat === s.id ? 'var(--accent)' : 'var(--line)'),
                        background: filterCat === s.id ? 'var(--accent-soft)' : '#fff',
                        color: filterCat === s.id ? 'var(--accent)' : 'var(--ink-2)',
                        fontWeight: filterCat === s.id ? 600 : 400,
                      }}
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 12, padding: '16px', marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', color: 'var(--ink-3)', marginBottom: 12, textTransform: 'uppercase' }}>Tip oglasa</div>
              {[
                { state: filterBarter,  set: setFilterBarter,  label: 'Spreman za razmenu', count: listings.filter(l => l.type === 'barter' || l.type === 'both').length },
                { state: filterPremium, set: setFilterPremium, label: 'Premium oglasi',      count: listings.filter(l => l.is_premium || l.is_featured).length },
              ].map(opt => (
                <label key={opt.label} style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', marginBottom: 10, fontSize: 13, color: 'var(--ink)' }}>
                  <input
                    type="checkbox"
                    checked={opt.state}
                    onChange={e => opt.set(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: 'var(--accent)', cursor: 'pointer' }}
                  />
                  <span style={{ flex: 1 }}>{opt.label}</span>
                  <span style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>{opt.count}</span>
                </label>
              ))}
            </div>

            <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 12, padding: '16px', marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', color: 'var(--ink-3)', marginBottom: 10, textTransform: 'uppercase' }}>Grad <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 10, color: 'var(--ink-4)' }}>(obavezno)</span></div>
              <select
                value={filterCity}
                onChange={e => setFilterCity(e.target.value)}
                style={{ width: '100%', padding: '9px 10px', borderRadius: 8, border: '1px solid var(--line)', fontSize: 13, color: 'var(--ink)', background: '#faf8f1', outline: 'none', cursor: 'pointer' }}
              >
                <option value="">Svi gradovi</option>
                {['Beograd','Novi Sad','Niš','Kragujevac','Subotica','Zrenjanin','Pančevo','Čačak','Novi Pazar','Kraljevo','Smederevo','Leskovac','Valjevo','Vranje','Šabac','Užice','Požarevac','Sombor','Kikinda'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 12, padding: '16px', marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', color: 'var(--ink-3)', marginBottom: 4, textTransform: 'uppercase' }}>
                Cena <span style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0, color: 'var(--ink-2)' }}>
                  do {filterMaxPrice >= 300000 ? '300.000+' : filterMaxPrice.toLocaleString('sr-RS')} RSD
                </span>
              </div>
              <input
                type="range" min={1000} max={300000} step={1000}
                value={filterMaxPrice}
                onChange={e => setFilterMaxPrice(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent)', marginTop: 10, marginBottom: 4 }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
                <span>1.000</span><span>300.000+</span>
              </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 12, padding: '16px', marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', color: 'var(--ink-3)', marginBottom: 12, textTransform: 'uppercase' }}>Stanje</div>
              {[
                { id: 'new',      label: 'Novo' },
                { id: 'like_new', label: 'Polovno — kao novo' },
                { id: 'good',     label: 'Polovno — odlično' },
                { id: 'fair',     label: 'Polovno — vrlo dobro' },
                { id: 'poor',     label: 'Polovno — dobro' },
                { id: 'antique',  label: 'Antikvitet' },
              ].map(opt => (
                <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', marginBottom: 9, fontSize: 13, color: 'var(--ink)' }}>
                  <input
                    type="checkbox"
                    checked={filterConditions.includes(opt.id)}
                    onChange={e => setFilterConditions(prev =>
                      e.target.checked ? [...prev, opt.id] : prev.filter(c => c !== opt.id)
                    )}
                    style={{ width: 16, height: 16, accentColor: 'var(--accent)', cursor: 'pointer' }}
                  />
                  {opt.label}
                </label>
              ))}
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                style={{ width: '100%', padding: '9px', borderRadius: 8, border: '1px solid var(--line)', background: '#fff', fontSize: 13, color: 'var(--ink-2)', cursor: 'pointer', fontWeight: 500 }}
              >
                Resetuj filtere
              </button>
            )}
          </aside>

          <main style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-3)', marginBottom: 16 }}>
              <span style={{ cursor: 'pointer', color: 'var(--accent)' }} onClick={() => setView('home')}>Početna</span>
              <span>›</span>
              <span style={{ color: 'var(--ink-2)' }}>
                {filterCat !== 'sve' ? activeCat?.name || 'Oglasi' : 'Oglasi'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 22, fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                  {searchQuery ? ('Rezultati: \u201e' + searchQuery + '\u201c') : activeCat?.name || 'Svi oglasi'}
                </h2>
                <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 3 }}>{filtered.length} oglasa</div>
              </div>
              <select
                value={filterSort}
                onChange={e => setFilterSort(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--line)', fontSize: 13, color: 'var(--ink)', background: '#fff', outline: 'none', cursor: 'pointer' }}
              >
                <option value="newest">Najnovije</option>
                <option value="price_asc">Cena: rastuće</option>
                <option value="price_desc">Cena: opadajuće</option>
              </select>
            </div>

            {filtered.length > 0 ? (
              <div className="list-grid">
                {filtered.map(l => (
                  <ListingCard key={l.id} item={l} fav={!!wishlistIds[l.id]} onFav={() => toggleFav(l.id)} onClick={() => onOpenItem(l)}/>
                ))}
              </div>
            ) : (
              <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--ink-3)' }}>
                <div style={{ fontSize: 18, color: 'var(--ink-2)', marginBottom: 8, fontFamily: 'var(--font-display)' }}>
                  {searchQuery ? ('Nema rezultata za \u201e' + searchQuery + '\u201c') : 'Nema rezultata'}
                </div>
                <div style={{ fontSize: 13.5, marginBottom: 20 }}>Probaj drugu reč ili promeni filtere.</div>
                <button className="nav-btn primary" onClick={() => requireAuth(() => setPostOpen(true))}>
                  <Icon name="plus" size={14} stroke={2.2}/> Postavi oglas
                </button>
              </div>
            )}
          </main>
        </div>
      )}

      {view === 'detail' && selectedItem && (
        <div data-screen-label="03 Listing detail" style={{ padding: '12px 0 60px' }}>
          <ListingDetail
            item={selectedItem}
            categories={categories}
            currentUser={currentUser}
            onBack={() => { setView('home'); setPendingOffer(null); }}
            onMessage={() => requireAuth(() => { setMessageTarget(selectedItem); setRazmeneOpen(true); })}
            onEdit={() => setEditItem(selectedItem)}
            onDelete={() => setDeleteConfirm(true)}
            onLogin={() => setLoginOpen(true)}
            pendingOffer={pendingOffer}
            onOfferRespond={handleOfferRespond}
            isSaved={!!wishlistIds[selectedItem.id]}
            onSaveToggle={handleSaveToggle}
          />
        </div>
      )}

      {view === 'my-listings' && (
        <section className="section" data-screen-label="04 Moji oglasi" style={{ paddingTop: 32 }}>
          <div className="section-inner">
            <div className="section-head">
              <div>
                <h2>Moji oglasi</h2>
                <div className="sub">{myListings.length} oglasa</div>
              </div>
              <button className="nav-btn primary" onClick={() => requireAuth(() => setPostOpen(true))}>
                <Icon name="plus" size={14}/> Novi oglas
              </button>
            </div>
            {myListings.length > 0 ? (
              <div className="list-grid">
                {myListings.map(l => (
                  <ListingCard key={l.id} item={l} fav={!!wishlistIds[l.id]} onFav={() => toggleFav(l.id)} onClick={() => onOpenItem(l)}/>
                ))}
              </div>
            ) : (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--ink-3)' }}>
                <div style={{ fontSize: 18, color: 'var(--ink-2)', marginBottom: 6, fontFamily: 'var(--font-display)' }}>
                  Još nemaš oglasa
                </div>
                <div style={{ fontSize: 13.5, marginBottom: 18 }}>Postavi prvi oglas i poveži se sa zajednicom.</div>
                <button className="nav-btn primary" onClick={() => requireAuth(() => setPostOpen(true))}>
                  <Icon name="plus" size={14}/> Postavi oglas
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {view === 'saved' && (
        <SavedScreen onOpenItem={onOpenItem} onPostAd={() => requireAuth(() => setPostOpen(true))}/>
      )}

      {view === 'ratings' && (
        <RatingsScreen onOpenItem={onOpenItem}/>
      )}

      {view === 'settings' && (
        <section className="section" style={{ paddingTop: 32 }}>
          <div className="section-inner">
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--ink-3)' }}>
              <div style={{ fontSize: 18, color: 'var(--ink-2)', marginBottom: 6, fontFamily: 'var(--font-display)' }}>
                Podešavanja
              </div>
              <div style={{ fontSize: 13.5 }}>Ova stranica je u izradi.</div>
              <button className="nav-btn" style={{ marginTop: 18 }} onClick={() => setView('home')}>
                Nazad na početnu
              </button>
            </div>
          </div>
        </section>
      )}

      {postOpen && (
        <PostAdModal onClose={() => setPostOpen(false)} categories={categories} onCreated={onCreatedListing} onView={(listing) => { const [n] = normalizeListings([listing]); setSelectedItem(n); setView('detail'); }}/>
      )}

      {editItem && (
        <EditAdModal
          item={editItem}
          categories={categories}
          onClose={() => setEditItem(null)}
          onSaved={(updated) => {
            const [norm] = normalizeListings([updated]);
            setListings(prev => prev.map(l => l.id === norm.id ? norm : l));
            setSelectedItem(norm);
            setEditItem(null);
          }}
        />
      )}

      {deleteConfirm && selectedItem && (
        <div className="scrim" onClick={() => setDeleteConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="mh">
              <h3>Obriši oglas</h3>
              <button className="x-btn" onClick={() => setDeleteConfirm(false)}><Icon name="x" size={16}/></button>
            </div>
            <div className="mb">
              <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                Sigurno želiš da obrišeš oglas{' '}
                <b style={{ color: 'var(--ink)' }}>„{selectedItem.title}"</b>?
                Ova akcija je nepovratna.
              </p>
            </div>
            <div className="mf">
              <button className="nav-btn" onClick={() => setDeleteConfirm(false)}>Otkaži</button>
              <button className="nav-btn" style={{ background: 'var(--warn)', color: '#fff', borderColor: 'var(--warn)' }} onClick={handleDelete}>
                <Icon name="trash" size={14}/> Obriši
              </button>
            </div>
          </div>
        </div>
      )}

      {razmeneOpen && (
        <RazmeneDrawer
          onClose={() => { setRazmeneOpen(false); setMessageTarget(null); }}
          currentUser={currentUser}
          targetListing={messageTarget}
        />
      )}

      {loginOpen && (
        <LoginModal onClose={() => setLoginOpen(false)} onSuccess={handleLoginSuccess} onSwitchToRegister={() => { setLoginOpen(false); setRegisterOpen(true); }}/>
      )}

      {registerOpen && (
        <RegisterModal onClose={() => setRegisterOpen(false)} onSuccess={handleLoginSuccess} onSwitchToLogin={() => { setRegisterOpen(false); setLoginOpen(true); }}/>
      )}

      {catPickerOpen && (
        <CategoryPickerModal
          categories={categories}
          selected={filterCat}
          onSelect={(id) => { setFilterCat(id); setCatPickerOpen(false); setView('search'); window.scrollTo({ top: 0 }); }}
          onClose={() => setCatPickerOpen(false)}
        />
      )}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Boja akcenta"/>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 6, padding: '4px 0' }}>
          {ACCENTS.map(a => (
            <button key={a.id} onClick={() => setTweak('accent', a.value)} title={a.id} style={{ width: '100%', aspectRatio: '1/1', borderRadius: 8, border: t.accent === a.value ? '2px solid #29261b' : '1px solid rgba(0,0,0,.1)', background: a.value, cursor: 'pointer', padding: 0 }}/>
          ))}
        </div>
        <TweakColor label="Custom" value={t.accent} onChange={(v) => setTweak('accent', v)}/>
        <TweakSection label="Font"/>
        <TweakSelect label="Tipografija" value={t.fontPair} options={Object.entries(FONT_PAIRS).map(([k, v]) => ({ value: k, label: v.label }))} onChange={(v) => setTweak('fontPair', v)}/>
        <TweakSection label="Hero"/>
        <TweakRadio label="Layout" value={t.heroLayout} options={[{ value: 'split', label: 'Split' }, { value: 'center', label: 'Centar' }, { value: 'grid', label: 'Grid' }]} onChange={(v) => setTweak('heroLayout', v)}/>
      </TweaksPanel>
    </div>
  );
}

(function () {
  const container = document.getElementById('root');
  if (!container) return;
  if (container.__reactRoot) {
    container.__reactRoot.render(<App />);
  } else {
    container.__reactRoot = ReactDOM.createRoot(container);
    container.__reactRoot.render(<App />);
  }
})();