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
  const [profileUser, setProfileUser]     = uS(null);
  const [phoneGate, setPhoneGate]         = uS(null); // callback to run after phone saved
  const [filterCat, setFilterCat]         = uS('sve');
  const [filterChip, setFilterChip]       = uS('sve');
  const [searchQuery, setSearchQuery]     = uS('');
  const [searchMode, setSearchMode]       = uS('find');
  const [filterCity, setFilterCity]       = uS('');
  const [filterRadius, setFilterRadius]   = uS(10);
  const [filterConditions, setFilterConditions] = uS([]);
  const [filterMaxPrice, setFilterMaxPrice]     = uS(300000);
  const [filterBarter, setFilterBarter]         = uS(false);
  const [filterPremium, setFilterPremium]       = uS(false);
  const [filterSort, setFilterSort]             = uS('newest');
  const [catPickerOpen, setCatPickerOpen]       = uS(false);
  const [page, setPage]                         = uS(1);
  const [totalPages, setTotalPages]             = uS(1);
  const [totalCount, setTotalCount]             = uS(0);
  const [listingsLoading, setListingsLoading]   = uS(false);

  const [favPending, setFavPending]       = uS({});
  const [postOpen, setPostOpen]           = uS(false);
  const [razmeneOpen, setRazmeneOpen]     = uS(false);
  const [messageTarget, setMessageTarget] = uS(null);
  const [notifsOpen, setNotifsOpen]       = uS(false);
  const [mobileNotifsOpen, setMobileNotifsOpen]   = uS(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = uS(false);
  const [userOpen, setUserOpen]           = uS(false);
  const [loginOpen, setLoginOpen]         = uS(false);
  const [registerOpen, setRegisterOpen]   = uS(false);
  const [editItem, setEditItem]           = uS(null);
  const [deleteConfirm, setDeleteConfirm] = uS(false);
  const [pendingOffer, setPendingOffer]   = uS(null);
  const [heroPendingOffers, setHeroPendingOffers] = uS([]);

  const [listings, setListings]           = uS([]);
  const [categories, setCategories]       = uS([]);
  const [currentUser, setCurrentUser]     = uS(null);
  const [notifications, setNotifications] = uS([]);
  const [wishlistIds, setWishlistIds]     = uS({});
  const [loading, setLoading]             = uS(true);
  const [apiError, setApiError]           = uS(null);

  const unreadNotifs  = notifications.filter(n => !n.is_read).length;
  const unreadThreads = 0;

  // ── URL helpers ──────────────────────────────────────────────
  const viewToPath = (v, item) => {
    if (v === 'detail' && item)  return '/oglasi/' + item.id;
    if (v === 'profile' && item) return '/profil/' + item.username;
    if (v === 'search')          return '/pretraga';
    if (v === 'my-listings')     return '/moji-oglasi';
    if (v === 'saved')           return '/sacuvano';
    if (v === 'ratings')         return '/ocene';
    if (v === 'settings')        return '/podesavanja';
    return '/';
  };

  const pathToView = (path) => {
    if (path.startsWith('/oglasi/'))  return 'detail';
    if (path.startsWith('/profil/'))  return 'profile';
    if (path === '/pretraga')         return 'search';
    if (path === '/moji-oglasi')      return 'my-listings';
    if (path === '/sacuvano')         return 'saved';
    if (path === '/ocene')            return 'ratings';
    if (path === '/podesavanja')      return 'settings';
    return 'home';
  };

  const navigate = (v, item, replace) => {
    const path = viewToPath(v, item);
    const state = { view: v, itemId: item ? (item.id || item.username) : null };
    if (replace) history.replaceState(state, '', path);
    else         history.pushState(state, '', path);
    setView(v);
    if (v === 'profile' && item) {
      apiUserProfile(item.username).then(res => {
        if (res.user) setProfileUser(res);
      });
    } else {
      if (item !== undefined) setSelectedItem(item);
    }
  };

  const onOpenProfile = (username) => {
    navigate('profile', { username });
  };

  const loadHeroPending = () => {
    apiMyOffers().then(res => {
      if (res.ok && res.results) {
        setHeroPendingOffers(res.results.filter(o => o.status === 'pending' && !o.is_sender));
      }
    });
  };

  uE(() => {
    // read initial URL so direct links and refreshes work
    const initView = pathToView(window.location.pathname);
    const initItemId = window.location.pathname.startsWith('/oglasi/')
      ? window.location.pathname.split('/oglasi/')[1]
      : null;

    // seed the current history entry with state so popstate works on first back
    history.replaceState({ view: initView, itemId: initItemId }, '', window.location.pathname);

    Promise.all([
      apiAuthStatus(),
      apiListings({ page: 1, sort: '-created_at' }),
      apiCategories(),
    ]).then(([auth, listData, catData]) => {
      if (auth.authenticated) {
        setCurrentUser(auth.user);
        apiNotifications().then(res => {
          if (res.ok && res.results) setNotifications(res.results);
        });
        loadHeroPending();

        apiWishlistIds().then(res => {
          if (res.ids) {
            const map = {};
            res.ids.forEach(id => { map[id] = true; });
            setWishlistIds(map);
          }
        });
      }
      const allListings = normalizeListings(listData.results || []);
      setListings(allListings);
      setTotalPages(listData.pages || 1);
      setTotalCount(listData.count || 0);
      setCategories([
        { id: 'sve', slug: 'sve', name: 'Sve kategorije', icon: 'grid', count: listData.count || 0, children: [] },
        ...normalizeCategories(catData.results || []),
      ]);

      // if landing on /oglasi/<id> directly, load the listing
      if (initView === 'detail' && initItemId) {
        const found = allListings.find(l => String(l.id) === String(initItemId));
        if (found) {
          setSelectedItem(found);
          setView('detail');
        } else {
          apiListingDetail(initItemId).then(res => {
            if (res.id) {
              const [norm] = normalizeListings([res]);
              setSelectedItem(norm);
              setView('detail');
            } else {
              setView('home');
            }
          });
        }
      } else {
        setView(initView);
      }

      setLoading(false);
    }).catch(err => {
      console.error('API greška:', err);
      setApiError('Nije moguće učitati podatke. Provjeri da li server radi.');
      setLoading(false);
    });
  }, []);

  // poll for new notifications every 30s when logged in
  uE(() => {
    if (!currentUser) return;
    const id = setInterval(() => {
      apiNotifications().then(res => {
        if (res.ok && res.results) setNotifications(res.results);
      });
    }, 30000);
    return () => clearInterval(id);
  }, [currentUser]);

  // handle browser back/forward
  uE(() => {
    const onPop = (e) => {
      const state = e.state || {};
      const v = state.view || pathToView(window.location.pathname);
      if (v === 'detail' && state.itemId) {
        const found = listings.find(l => String(l.id) === String(state.itemId));
        if (found) {
          setSelectedItem(found);
          setView('detail');
        } else {
          apiListingDetail(state.itemId).then(res => {
            if (res.id) {
              const [norm] = normalizeListings([res]);
              setSelectedItem(norm);
              setView('detail');
            } else {
              setView('home');
            }
          });
        }
      } else {
        setSelectedItem(null);
        setView(v);
      }
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [listings]);

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
      else if (view === 'detail') { navigate('home', null); setPendingOffer(null); }
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
        navigate('detail', item);
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

  const requirePhone = (action) => {
    if (!currentUser) { setLoginOpen(true); return; }
    if (currentUser.has_phone) { action(); return; }
    setPhoneGate(() => action);
  };

  const requireAuth = (action) => {
    if (currentUser) action();
    else setLoginOpen(true);
  };

  const handleOfferRespond = async (offerId, action) => {
    const res = await apiRespondToOffer(offerId, action);
    if (res.ok) setPendingOffer(null);
  };

  const handleHeroOfferRespond = async (offerId, action) => {
    const res = await apiRespondToOffer(offerId, action);
    if (res.ok) setHeroPendingOffers(prev => prev.filter(o => o.id !== offerId));
  };

  const buildParams = (p) => {
    const params = { page: p || page };
    if (searchQuery)        params.q        = searchQuery;
    if (filterCat !== 'sve') {
      const cat = categories.find(c => c.id === filterCat);
      if (cat) params.category = cat.slug;
    }
    if (filterCity)         params.city     = filterCity;
    if (filterBarter)       params.type     = 'barter';
    if (filterChip === 'sell') params.type  = 'sell';
    if (filterPremium)      params.premium  = '1';
    if (filterConditions.length > 0) params.condition = filterConditions.join(',');
    if (filterMaxPrice < 300000) params.max_price = filterMaxPrice;
    const sortMap = { newest: '-created_at', price_asc: 'price', price_desc: '-price' };
    params.sort = sortMap[filterSort] || '-created_at';
    if (searchMode === 'offer') params.search_mode = 'offer';
    return params;
  };

  const fetchListings = (p) => {
    setListingsLoading(true);
    apiListings(buildParams(p)).then(res => {
      setListings(normalizeListings(res.results || []));
      setTotalPages(res.pages || 1);
      setTotalCount(res.count || 0);
      setListingsLoading(false);
    });
  };

  uE(() => {
    if (view !== 'search' && view !== 'home') return;
    setPage(1);
    fetchListings(1);
  }, [filterCat, searchQuery, filterCity, filterBarter, filterChip, filterPremium, filterConditions, filterMaxPrice, filterSort, searchMode]);

  uE(() => {
    if (view !== 'search' && view !== 'home') return;
    fetchListings(page);
  }, [page]);

  const filtered = listings;

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

  const onSearch = (q, mode) => {
    setSearchQuery(q);
    if (mode) setSearchMode(mode);
    setFilterChip('sve');
    navigate('search', null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSelectCat = (id) => {
    setFilterCat(id);
    setFilterChip('sve');
    navigate('search', null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onOpenItem = (item) => {
    navigate('detail', item);
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
    navigate('home', null);
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
        onPostAd={() => requirePhone(() => setPostOpen(true))}
        onOpenNotifs={(e) => {
          if (e && e.stopPropagation) e.stopPropagation();
          if (window.innerWidth < 640) {
            setMobileNotifsOpen(true);
            if (unreadNotifs > 0) apiMarkNotificationsRead().then(() => setNotifications(prev => prev.map(n => ({ ...n, is_read: true }))));
          } else {
            setUserOpen(false);
            setNotifsOpen(v => !v);
          }
        }}
        onOpenRazmene={() => requireAuth(() => { setMessageTarget(null); setRazmeneOpen(true); })}
        onOpenUser={(e) => { e.stopPropagation(); setNotifsOpen(false); setUserOpen(v => !v); }}
        openNotifs={notifsOpen}
        openUser={userOpen}
        onSearch={onSearch}
        onNav={(v) => { navigate(v, null); setSearchQuery(''); setFilterCat('sve'); setFilterChip('sve'); setUserOpen(false); }}
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
            onPostAd={() => requirePhone(() => setPostOpen(true))}
            onCityChange={(city, radius) => {
              setFilterCity(city);
              setFilterRadius(radius);
            }}
            pendingOffers={heroPendingOffers}
            onOfferRespond={handleHeroOfferRespond}
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
                  <button className="nav-btn primary" style={{ marginTop: 14 }} onClick={() => requirePhone(() => setPostOpen(true))}>
                    <Icon name="plus" size={14}/> Postavi oglas
                  </button>
                </div>
              ) : (
                <div className="list-grid">
                  {listings.slice(0, 8).map(l => (
                    <ListingCard key={l.id} item={l} fav={!!wishlistIds[l.id]} onFav={() => toggleFav(l.id)} onClick={() => onOpenItem(l)} onOpenProfile={onOpenProfile}/>
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
        <div className="search-layout" style={{ display: 'grid', gridTemplateColumns: '268px 1fr', gap: 28, maxWidth: 1280, margin: '0 auto', padding: '24px 24px 60px', alignItems: 'start' }}>

          <aside className="search-aside" style={{ gridColumn: 1, gridRow: 1, position: 'sticky', top: 80, width: 268 }}>

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

          {mobileFiltersOpen && ReactDOM.createPortal(
            <div className="filter-sheet-overlay" onClick={() => setMobileFiltersOpen(false)}>
              <div className="filter-sheet" onClick={e => e.stopPropagation()}>
                <div className="filter-sheet-handle"/>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px 12px' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>Filteri</div>
                  {hasActiveFilters && (
                    <button onClick={resetFilters} style={{ background: 'none', border: 'none', fontSize: 13, color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}>Resetuj</button>
                  )}
                </div>

                <div style={{ padding: '0 16px 8px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', color: 'var(--ink-3)', marginBottom: 8, textTransform: 'uppercase' }}>Kategorija</div>
                  <button
                    onClick={() => { setMobileFiltersOpen(false); setCatPickerOpen(true); }}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid ' + (filterCat !== 'sve' ? 'var(--accent)' : 'var(--line)'), background: filterCat !== 'sve' ? 'var(--accent-soft)' : '#faf8f1', fontSize: 13, color: filterCat !== 'sve' ? 'var(--accent)' : 'var(--ink-2)', cursor: 'pointer', fontWeight: filterCat !== 'sve' ? 600 : 400, display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left' }}
                  >
                    <Icon name="grid" size={14}/>
                    <span style={{ flex: 1 }}>{filterCat !== 'sve' ? (activeCat ? activeCat.name : filterCat) : 'Izaberi kategoriju'}</span>
                    {filterCat !== 'sve' && <span onClick={e => { e.stopPropagation(); setFilterCat('sve'); }} style={{ color: 'var(--accent)', fontSize: 16, fontWeight: 700 }}>×</span>}
                  </button>
                </div>

                <div style={{ padding: '12px 16px 8px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', color: 'var(--ink-3)', marginBottom: 10, textTransform: 'uppercase' }}>Tip oglasa</div>
                  {[
                    { state: filterBarter,  set: setFilterBarter,  label: 'Spreman za razmenu' },
                    { state: filterPremium, set: setFilterPremium, label: 'Premium oglasi' },
                  ].map(opt => (
                    <label key={opt.label} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 12, fontSize: 14, color: 'var(--ink)' }}>
                      <input type="checkbox" checked={opt.state} onChange={e => opt.set(e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--accent)', cursor: 'pointer' }}/>
                      {opt.label}
                    </label>
                  ))}
                </div>

                <div style={{ padding: '12px 16px 8px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', color: 'var(--ink-3)', marginBottom: 8, textTransform: 'uppercase' }}>Grad</div>
                  <select value={filterCity} onChange={e => setFilterCity(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--line)', fontSize: 14, color: 'var(--ink)', background: '#faf8f1', outline: 'none' }}>
                    <option value="">Svi gradovi</option>
                    {['Beograd','Novi Sad','Niš','Kragujevac','Subotica','Zrenjanin','Pančevo','Čačak','Novi Pazar','Kraljevo','Smederevo','Leskovac','Valjevo','Vranje','Šabac','Užice','Požarevac','Sombor','Kikinda'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div style={{ padding: '12px 16px 8px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', color: 'var(--ink-3)', marginBottom: 4, textTransform: 'uppercase' }}>
                    Cena do {filterMaxPrice >= 300000 ? '300.000+' : filterMaxPrice.toLocaleString('sr-RS')} RSD
                  </div>
                  <input type="range" min={1000} max={300000} step={1000} value={filterMaxPrice} onChange={e => setFilterMaxPrice(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent)', marginTop: 8 }}/>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                    <span>1.000</span><span>300.000+</span>
                  </div>
                </div>

                <div style={{ padding: '12px 16px 8px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', color: 'var(--ink-3)', marginBottom: 10, textTransform: 'uppercase' }}>Stanje</div>
                  {[
                    { id: 'new',      label: 'Novo' },
                    { id: 'like_new', label: 'Polovno — kao novo' },
                    { id: 'good',     label: 'Polovno — odlično' },
                    { id: 'fair',     label: 'Polovno — vrlo dobro' },
                    { id: 'poor',     label: 'Polovno — dobro' },
                    { id: 'antique',  label: 'Antikvitet' },
                  ].map(opt => (
                    <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 10, fontSize: 14, color: 'var(--ink)' }}>
                      <input type="checkbox" checked={filterConditions.includes(opt.id)} onChange={e => setFilterConditions(prev => e.target.checked ? [...prev, opt.id] : prev.filter(c => c !== opt.id))} style={{ width: 18, height: 18, accentColor: 'var(--accent)', cursor: 'pointer' }}/>
                      {opt.label}
                    </label>
                  ))}
                </div>

                <div style={{ padding: '12px 16px 8px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', color: 'var(--ink-3)', marginBottom: 10, textTransform: 'uppercase' }}>Sortiranje</div>
                  {[
                    { id: 'newest',     label: 'Najnovije' },
                    { id: 'price_asc',  label: 'Cena: rastuće' },
                    { id: 'price_desc', label: 'Cena: opadajuće' },
                  ].map(opt => (
                    <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 10, fontSize: 14, color: 'var(--ink)' }}>
                      <input type="radio" name="sort" checked={filterSort === opt.id} onChange={() => setFilterSort(opt.id)} style={{ width: 18, height: 18, accentColor: 'var(--accent)', cursor: 'pointer' }}/>
                      {opt.label}
                    </label>
                  ))}
                </div>

                <div style={{ padding: '16px', position: 'sticky', bottom: 0, background: '#fff', borderTop: '1px solid var(--line)' }}>
                  <button className="nav-btn primary" style={{ width: '100%', justifyContent: 'center', fontSize: 15 }} onClick={() => setMobileFiltersOpen(false)}>
                    Prikaži {totalCount} {totalCount === 1 ? 'oglas' : 'oglasa'}
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}

          <main className="search-main" style={{ gridColumn: 2, gridRow: 1, minWidth: 0, minHeight: 620 }}>
            <div className="mobile-filter-bar" style={{ display: 'none', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <button
                onClick={() => setMobileFiltersOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 8, border: '1px solid ' + (hasActiveFilters ? 'var(--accent)' : 'var(--line)'), background: hasActiveFilters ? 'var(--accent-soft)' : '#fff', fontSize: 13, fontWeight: 600, color: hasActiveFilters ? 'var(--accent)' : 'var(--ink)', cursor: 'pointer' }}
              >
                <Icon name="filter" size={14}/>
                Filteri
                {hasActiveFilters && (
                  <span style={{ background: 'var(--accent)', color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                    {[filterBarter, filterPremium, filterCity, filterConditions.length > 0, filterMaxPrice < 300000, filterCat !== 'sve'].filter(Boolean).length}
                  </span>
                )}
              </button>
              {hasActiveFilters && (
                <button onClick={resetFilters} style={{ background: 'none', border: 'none', fontSize: 13, color: 'var(--ink-3)', cursor: 'pointer', padding: '4px 0' }}>Resetuj</button>
              )}
            </div>
            <div className="search-text-row" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-3)', marginBottom: 16 }}>
              <span style={{ cursor: 'pointer', color: 'var(--accent)' }} onClick={() => navigate('home', null)}>Početna</span>
              <span>›</span>
              <span style={{ color: 'var(--ink-2)' }}>
                {filterCat !== 'sve' ? activeCat?.name || 'Oglasi' : 'Oglasi'}
              </span>
            </div>

            <div className="search-text-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 22, fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                  {searchQuery ? ('Rezultati: \u201e' + searchQuery + '\u201c') : activeCat?.name || 'Svi oglasi'}
                </h2>
                <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 3 }}>{totalCount} oglasa</div>
              </div>
              <select
                value={filterSort}
                onChange={e => setFilterSort(e.target.value)}
                className="sort-select-desktop"
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--line)', fontSize: 13, color: 'var(--ink)', background: '#fff', outline: 'none', cursor: 'pointer' }}
              >
                <option value="newest">Najnovije</option>
                <option value="price_asc">Cena: rastuće</option>
                <option value="price_desc">Cena: opadajuće</option>
              </select>
            </div>

            {listingsLoading ? (
              <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 14 }}>Učitavam…</div>
            ) : filtered.length > 0 ? (
              <>
                <div className="list-grid">
                  {filtered.map(l => (
                    <ListingCard key={l.id} item={l} fav={!!wishlistIds[l.id]} onFav={() => toggleFav(l.id)} onClick={() => onOpenItem(l)} onOpenProfile={onOpenProfile}/>
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="search-text-row" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 32, flexWrap: 'wrap' }}>
                    <button
                      onClick={() => { setPage(p => p - 1); window.scrollTo(0, 0); }}
                      disabled={page === 1}
                      style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--line)', background: '#fff', cursor: page === 1 ? 'default' : 'pointer', color: page === 1 ? 'var(--ink-3)' : 'var(--ink)', fontSize: 13 }}
                    >← Prethodna</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 2)
                      .reduce((acc, n, i, arr) => {
                        if (i > 0 && n - arr[i - 1] > 1) acc.push('...');
                        acc.push(n);
                        return acc;
                      }, [])
                      .map((n, i) => n === '...' ? (
                        <span key={'dots' + i} style={{ color: 'var(--ink-3)', fontSize: 13, padding: '0 4px' }}>…</span>
                      ) : (
                        <button
                          key={n}
                          onClick={() => { setPage(n); window.scrollTo(0, 0); }}
                          style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid ' + (page === n ? 'var(--accent)' : 'var(--line)'), background: page === n ? 'var(--accent)' : '#fff', color: page === n ? '#fff' : 'var(--ink)', fontWeight: page === n ? 700 : 400, cursor: 'pointer', fontSize: 13 }}
                        >{n}</button>
                      ))
                    }
                    <button
                      onClick={() => { setPage(p => p + 1); window.scrollTo(0, 0); }}
                      disabled={page === totalPages}
                      style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--line)', background: '#fff', cursor: page === totalPages ? 'default' : 'pointer', color: page === totalPages ? 'var(--ink-3)' : 'var(--ink)', fontSize: 13 }}
                    >Sledeća →</button>
                  </div>
                )}
              </>
            ) : (
              <div className="search-text-row" style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--ink-3)' }}>
                <div style={{ fontSize: 18, color: 'var(--ink-2)', marginBottom: 8, fontFamily: 'var(--font-display)' }}>
                  {searchQuery ? ('Nema rezultata za \u201e' + searchQuery + '\u201c') : 'Nema rezultata'}
                </div>
                <div style={{ fontSize: 13.5, marginBottom: 20 }}>Probaj drugu reč ili promeni filtere.</div>
                <button className="nav-btn primary" onClick={() => requirePhone(() => setPostOpen(true))}>
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
            onBack={() => { navigate('home', null); setPendingOffer(null); }}
            onMessage={() => requireAuth(() => { setMessageTarget(selectedItem); setRazmeneOpen(true); })}
            onEdit={() => setEditItem(selectedItem)}
            onDelete={() => setDeleteConfirm(true)}
            onLogin={() => setLoginOpen(true)}
            pendingOffer={pendingOffer}
            onOfferRespond={handleOfferRespond}
            isSaved={!!wishlistIds[selectedItem.id]}
            onSaveToggle={handleSaveToggle}
            onOpenProfile={onOpenProfile}
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
              <button className="nav-btn primary" onClick={() => requirePhone(() => setPostOpen(true))}>
                <Icon name="plus" size={14}/> Novi oglas
              </button>
            </div>
            {myListings.length > 0 ? (
              <div className="list-grid">
                {myListings.map(l => (
                  <ListingCard key={l.id} item={l} fav={!!wishlistIds[l.id]} onFav={() => toggleFav(l.id)} onClick={() => onOpenItem(l)} onOpenProfile={onOpenProfile}/>
                ))}
              </div>
            ) : (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--ink-3)' }}>
                <div style={{ fontSize: 18, color: 'var(--ink-2)', marginBottom: 6, fontFamily: 'var(--font-display)' }}>
                  Još nemaš oglasa
                </div>
                <div style={{ fontSize: 13.5, marginBottom: 18 }}>Postavi prvi oglas i poveži se sa zajednicom.</div>
                <button className="nav-btn primary" onClick={() => requirePhone(() => setPostOpen(true))}>
                  <Icon name="plus" size={14}/> Postavi oglas
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {view === 'saved' && (
        <SavedScreen onOpenItem={onOpenItem} onPostAd={() => requirePhone(() => setPostOpen(true))}/>
      )}

      {view === 'ratings' && (
        <RatingsScreen onOpenItem={onOpenItem}/>
      )}

      {view === 'settings' && currentUser && (
        <SettingsScreen
          currentUser={currentUser}
          onUserUpdated={(updated) => setCurrentUser(u => ({ ...u, ...updated }))}
        />
      )}

      {view === 'profile' && profileUser && (
        <ProfileScreen
          user={profileUser}
          currentUser={currentUser}
          onBack={() => navigate('home', null)}
          onOpenItem={onOpenItem}
          onOpenProfile={onOpenProfile}
        />
      )}

      {phoneGate && (
        <PhoneGateModal
          onClose={() => setPhoneGate(null)}
          onSaved={(phone) => {
            setCurrentUser(u => ({ ...u, phone, has_phone: true }));
            setPhoneGate(null);
            phoneGate();
          }}
        />
      )}

      {postOpen && (
        <PostAdModal onClose={() => setPostOpen(false)} categories={categories} onCreated={onCreatedListing} onView={(listing) => { const [n] = normalizeListings([listing]); navigate('detail', n); }}/>
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

      {mobileNotifsOpen && (
        <NotificationsDrawer
          notifications={notifications}
          onClose={() => setMobileNotifsOpen(false)}
          onMarkRead={() => { handleMarkRead(); }}
          onNotifClick={(notif) => { setMobileNotifsOpen(false); handleNotifClick(notif); }}
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
          onSelect={(id) => { setFilterCat(id); setCatPickerOpen(false); navigate('search', null); window.scrollTo({ top: 0 }); }}
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