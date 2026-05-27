const {
  useState,
  useEffect,
  useRef
} = React;
const SERBIAN_CITIES = [{
  id: '',
  name: 'Cela Srbija'
}, {
  id: 'Beograd',
  name: 'Beograd'
}, {
  id: 'Novi Sad',
  name: 'Novi Sad'
}, {
  id: 'Niš',
  name: 'Niš'
}, {
  id: 'Kragujevac',
  name: 'Kragujevac'
}, {
  id: 'Subotica',
  name: 'Subotica'
}, {
  id: 'Zrenjanin',
  name: 'Zrenjanin'
}, {
  id: 'Pančevo',
  name: 'Pančevo'
}, {
  id: 'Čačak',
  name: 'Čačak'
}, {
  id: 'Novi Pazar',
  name: 'Novi Pazar'
}, {
  id: 'Kraljevo',
  name: 'Kraljevo'
}, {
  id: 'Smederevo',
  name: 'Smederevo'
}, {
  id: 'Leskovac',
  name: 'Leskovac'
}, {
  id: 'Valjevo',
  name: 'Valjevo'
}, {
  id: 'Vranje',
  name: 'Vranje'
}, {
  id: 'Šabac',
  name: 'Šabac'
}, {
  id: 'Užice',
  name: 'Užice'
}, {
  id: 'Požarevac',
  name: 'Požarevac'
}, {
  id: 'Sombor',
  name: 'Sombor'
}, {
  id: 'Kikinda',
  name: 'Kikinda'
}];

/* ─── NAV ─────────────────────────────────────── */
function Nav({
  unreadNotifs,
  unreadThreads,
  currentUser,
  onPostAd,
  onOpenNotifs,
  onOpenRazmene,
  onOpenUser,
  openNotifs,
  openUser,
  onSearch,
  onNav,
  onLogin,
  onLogout,
  onMarkRead,
  onNotifClick,
  notifications,
  categories,
  onSelectCat
}) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [burgerOpen, setBurgerOpen] = useState(false);
  const userRef = useRef(null);
  const initials = currentUser ? currentUser.first_name && currentUser.last_name ? (currentUser.first_name[0] + currentUser.last_name[0]).toUpperCase() : currentUser.username.slice(0, 2).toUpperCase() : '';
  const displayName = currentUser ? currentUser.first_name || currentUser.username : '';
  const handleSubmit = e => {
    e.preventDefault();
    if (cat) onSelectCat && onSelectCat(cat);
    onSearch(q);
  };
  const handleCatChange = e => {
    const val = e.target.value;
    setCat(val);
    onSelectCat && onSelectCat(val || 'sve');
  };
  const closeBurger = () => setBurgerOpen(false);
  const burgerNav = view => {
    closeBurger();
    onNav && onNav(view);
  };
  const totalBadge = (unreadNotifs || 0) + (unreadThreads || 0);
  return /*#__PURE__*/React.createElement("header", {
    className: "nav"
  }, /*#__PURE__*/React.createElement("div", {
    className: "nav-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "brand",
    onClick: () => onNav('home'),
    style: {
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "brand-mark",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.4",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "m7 4 4 4-4 4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 8h12a4 4 0 0 1 4 4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m17 20-4-4 4-4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M21 16H9a4 4 0 0 1-4-4"
  }))), /*#__PURE__*/React.createElement("span", null, "Daj Zameni"), /*#__PURE__*/React.createElement("small", {
    className: "nav-beta"
  }, "beta")), /*#__PURE__*/React.createElement("form", {
    className: "nav-search",
    onSubmit: handleSubmit
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 16,
    stroke: 1.8,
    style: {
      color: 'var(--ink-3)',
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("input", {
    value: q,
    onChange: e => setQ(e.target.value),
    placeholder: "\u0160ta nudite?"
  }), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "s-btn"
  }, "Pretra\u017Ei")), /*#__PURE__*/React.createElement("div", {
    className: "nav-actions nav-actions-desktop"
  }, /*#__PURE__*/React.createElement("button", {
    className: "nav-btn primary",
    onClick: onPostAd
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 15,
    stroke: 2.2
  }), /*#__PURE__*/React.createElement("span", null, "Oglas")), currentUser ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "nav-btn icon",
    onClick: onOpenNotifs,
    "aria-label": "Obave\u0161tenja"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "bell",
    size: 17
  }), unreadNotifs > 0 && /*#__PURE__*/React.createElement("span", {
    className: "badge"
  }, unreadNotifs)), openNotifs && /*#__PURE__*/React.createElement(NotificationsPopover, {
    notifications: notifications || [],
    onMarkRead: onMarkRead,
    onNotifClick: onNotifClick
  })), /*#__PURE__*/React.createElement("button", {
    className: "nav-btn",
    onClick: onOpenRazmene
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "swap",
    size: 16
  }), /*#__PURE__*/React.createElement("span", null, "Poruke"), unreadThreads > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      background: 'var(--accent)',
      color: '#fff',
      fontSize: 10,
      fontWeight: 700,
      padding: '1px 6px',
      borderRadius: 8,
      fontFamily: 'var(--font-mono)'
    }
  }, unreadThreads)), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    },
    ref: userRef
  }, /*#__PURE__*/React.createElement("button", {
    className: "user-chip",
    onClick: onOpenUser
  }, /*#__PURE__*/React.createElement("span", {
    className: "avatar"
  }, initials), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600
    }
  }, displayName), /*#__PURE__*/React.createElement(Icon, {
    name: "caret",
    size: 11,
    className: "caret"
  })), openUser && /*#__PURE__*/React.createElement("div", {
    className: "menu",
    role: "menu"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 14px 8px',
      borderBottom: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 13.5
    }
  }, currentUser.username), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ink-3)',
      marginTop: 1
    }
  }, currentUser.email)), /*#__PURE__*/React.createElement("div", {
    className: "item",
    onClick: () => {
      onNav && onNav('my-listings');
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "tag",
    size: 15
  }), " Moji oglasi"), /*#__PURE__*/React.createElement("div", {
    className: "item",
    onClick: () => {
      onNav && onNav('saved');
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "heart",
    size: 15
  }), " Sa\u010Duvano"), /*#__PURE__*/React.createElement("div", {
    className: "item",
    onClick: () => {
      onNav && onNav('ratings');
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "star",
    size: 15
  }), " Ocene i istorija"), /*#__PURE__*/React.createElement("div", {
    className: "item",
    onClick: () => {
      onNav && onNav('settings');
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "sliders",
    size: 15
  }), " Pode\u0161avanja"), /*#__PURE__*/React.createElement("div", {
    className: "sep"
  }), /*#__PURE__*/React.createElement("div", {
    className: "item danger",
    onClick: onLogout
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "logout",
    size: 15
  }), " Odjava")))) : /*#__PURE__*/React.createElement("button", {
    className: "nav-btn",
    onClick: onLogin,
    style: {
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "user",
    size: 15
  }), /*#__PURE__*/React.createElement("span", null, "Prijava"))), /*#__PURE__*/React.createElement("div", {
    className: "nav-actions-mobile"
  }, /*#__PURE__*/React.createElement("button", {
    className: "nav-btn icon",
    onClick: () => setBurgerOpen(true),
    style: {
      position: 'relative',
      width: 40,
      height: 40
    },
    "aria-label": "Meni"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "menu",
    size: 22
  }), totalBadge > 0 && /*#__PURE__*/React.createElement("span", {
    className: "badge",
    style: {
      top: 4,
      right: 4
    }
  }, totalBadge > 9 ? '9+' : totalBadge)))), burgerOpen && ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(0,0,0,.5)'
    },
    onClick: closeBurger
  }, /*#__PURE__*/React.createElement("div", {
    className: "mobile-drawer",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 20px',
      borderBottom: '1px solid var(--line)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, currentUser ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "avatar",
    style: {
      width: 38,
      height: 38,
      fontSize: 14
    }
  }, initials), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 15,
      color: 'var(--ink)'
    }
  }, displayName), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--ink-3)',
      marginTop: 1
    }
  }, currentUser.email))) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      fontSize: 16,
      color: 'var(--ink)'
    }
  }, "Meni"), /*#__PURE__*/React.createElement("button", {
    onClick: closeBurger,
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--ink-3)',
      display: 'grid',
      placeItems: 'center',
      padding: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 22
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 20px',
      borderBottom: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      closeBurger();
      onPostAd && onPostAd();
    },
    style: {
      width: '100%',
      padding: '13px 0',
      background: 'var(--accent)',
      color: '#fff',
      border: 'none',
      borderRadius: 10,
      fontWeight: 700,
      fontSize: 15,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 18,
    stroke: 2.5
  }), "Postavi oglas")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto'
    }
  }, currentUser ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "drawer-item",
    onClick: () => {
      closeBurger();
      onOpenNotifs && onOpenNotifs();
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "bell",
    size: 20
  }), /*#__PURE__*/React.createElement("span", null, "Obave\u0161tenja")), unreadNotifs > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      background: 'var(--accent)',
      color: '#fff',
      fontSize: 12,
      fontWeight: 700,
      padding: '2px 8px',
      borderRadius: 10,
      fontFamily: 'var(--font-mono)'
    }
  }, unreadNotifs)), /*#__PURE__*/React.createElement("div", {
    className: "drawer-item",
    onClick: () => {
      closeBurger();
      onOpenRazmene && onOpenRazmene();
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "swap",
    size: 20
  }), /*#__PURE__*/React.createElement("span", null, "Poruke")), unreadThreads > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      background: 'var(--accent)',
      color: '#fff',
      fontSize: 12,
      fontWeight: 700,
      padding: '2px 8px',
      borderRadius: 10,
      fontFamily: 'var(--font-mono)'
    }
  }, unreadThreads)), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--line)',
      margin: '6px 20px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "drawer-item",
    onClick: () => burgerNav('my-listings')
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "tag",
    size: 20
  }), /*#__PURE__*/React.createElement("span", null, "Moji oglasi"))), /*#__PURE__*/React.createElement("div", {
    className: "drawer-item",
    onClick: () => burgerNav('saved')
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "heart",
    size: 20
  }), /*#__PURE__*/React.createElement("span", null, "Sa\u010Duvano"))), /*#__PURE__*/React.createElement("div", {
    className: "drawer-item",
    onClick: () => burgerNav('ratings')
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "star",
    size: 20
  }), /*#__PURE__*/React.createElement("span", null, "Ocene i istorija"))), /*#__PURE__*/React.createElement("div", {
    className: "drawer-item",
    onClick: () => burgerNav('settings')
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "sliders",
    size: 20
  }), /*#__PURE__*/React.createElement("span", null, "Pode\u0161avanja"))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--line)',
      margin: '6px 20px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "drawer-item danger",
    onClick: () => {
      closeBurger();
      onLogout && onLogout();
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "logout",
    size: 20
  }), /*#__PURE__*/React.createElement("span", null, "Odjava")))) : /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      closeBurger();
      onLogin && onLogin();
    },
    style: {
      width: '100%',
      padding: '13px 0',
      background: 'var(--accent)',
      color: '#fff',
      border: 'none',
      borderRadius: 10,
      fontWeight: 700,
      fontSize: 15,
      cursor: 'pointer'
    }
  }, "Prijava"), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      closeBurger();
      onLogin && onLogin();
    },
    style: {
      width: '100%',
      padding: '13px 0',
      background: 'transparent',
      color: 'var(--ink)',
      border: '1.5px solid var(--line)',
      borderRadius: 10,
      fontWeight: 600,
      fontSize: 15,
      cursor: 'pointer'
    }
  }, "Registracija"))))), document.body));
}

/* ─── NOTIFICATIONS POPOVER ──────────────────── */
function NotificationsPopover({
  notifications = [],
  onMarkRead,
  onNotifClick
}) {
  const fmtTime = iso => {
    if (!iso) return '';
    const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (diff < 60) return 'upravo';
    if (diff < 3600) return Math.floor(diff / 60) + ' min';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h';
    return Math.floor(diff / 86400) + 'd';
  };
  const typeIcon = type => {
    if (type === 'offer' || type === 'offer_accepted' || type === 'offer_declined') return 'swap';
    if (type === 'message') return 'msg';
    return 'bell';
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "pop",
    role: "dialog",
    "aria-label": "Obave\u0161tenja"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ph"
  }, /*#__PURE__*/React.createElement("h4", null, "Obave\u0161tenja"), notifications.some(n => !n.is_read) && /*#__PURE__*/React.createElement("button", {
    onClick: onMarkRead
  }, "Ozna\u010Di sve kao pro\u010Ditano")), /*#__PURE__*/React.createElement("div", {
    className: "pl"
  }, notifications.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '32px 16px',
      textAlign: 'center',
      color: 'var(--ink-3)',
      fontSize: 13
    }
  }, "Nema novih obave\u0161tenja") : notifications.map(n => /*#__PURE__*/React.createElement("div", {
    key: n.id,
    className: 'notif' + (!n.is_read ? ' unread' : ''),
    onClick: () => onNotifClick && onNotifClick(n),
    style: {
      cursor: onNotifClick ? 'pointer' : 'default'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "ni"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: typeIcon(n.type),
    size: 16
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "nt"
  }, n.text), /*#__PURE__*/React.createElement("div", {
    className: "ntime"
  }, fmtTime(n.created_at)))))));
}

/* ─── NOTIFICATIONS DRAWER (mobile) ─────────────── */
function NotificationsDrawer({
  notifications = [],
  onClose,
  onMarkRead,
  onNotifClick
}) {
  const fmtTime = iso => {
    if (!iso) return '';
    const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (diff < 60) return 'upravo';
    if (diff < 3600) return Math.floor(diff / 60) + ' min';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h';
    return Math.floor(diff / 86400) + 'd';
  };
  const typeIcon = type => {
    if (type === 'offer' || type === 'offer_accepted' || type === 'offer_declined') return 'swap';
    if (type === 'message') return 'msg';
    return 'bell';
  };
  return ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(0,0,0,.5)'
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      animation: 'slideInRight .22s cubic-bezier(.22,.61,.36,1) both'
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 20px',
      borderBottom: '1px solid var(--line)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      fontSize: 17,
      color: 'var(--ink)'
    }
  }, "Obave\u0161tenja"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, notifications.some(n => !n.is_read) && /*#__PURE__*/React.createElement("button", {
    onClick: onMarkRead,
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: 13,
      color: 'var(--accent)',
      fontWeight: 600,
      padding: 0
    }
  }, "Sve pro\u010Ditano"), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--ink-3)',
      display: 'grid',
      placeItems: 'center',
      padding: 4
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 22
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto'
    }
  }, notifications.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '60px 20px',
      textAlign: 'center',
      color: 'var(--ink-3)',
      fontSize: 14
    }
  }, "Nema novih obave\u0161tenja") : notifications.map(n => /*#__PURE__*/React.createElement("div", {
    key: n.id,
    onClick: () => onNotifClick && onNotifClick(n),
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 14,
      padding: '16px 20px',
      borderBottom: '1px solid var(--line)',
      background: n.is_read ? 'transparent' : 'var(--accent-soft)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      borderRadius: '50%',
      background: n.is_read ? 'var(--line)' : 'var(--accent-soft)',
      border: n.is_read ? 'none' : '1.5px solid var(--accent)',
      display: 'grid',
      placeItems: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: typeIcon(n.type),
    size: 16,
    style: {
      color: n.is_read ? 'var(--ink-3)' : 'var(--accent)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: 'var(--ink)',
      fontWeight: n.is_read ? 400 : 600,
      lineHeight: 1.4
    }
  }, n.text), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ink-3)',
      marginTop: 4
    }
  }, fmtTime(n.created_at))), !n.is_read && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: 'var(--accent)',
      flexShrink: 0,
      marginTop: 4
    }
  })))))), document.body);
}

/* ─── HERO ─────────────────────────────────────── */
function Hero({
  layout,
  accent,
  onSearch,
  onPostAd,
  onCityChange,
  pendingOffers = [],
  onOfferRespond
}) {
  const [q, setQ] = useState('');
  const [mode, setMode] = useState('find');
  const [city, setCity] = useState('');
  const [radius, setRadius] = useState(10);
  const [showPicker, setShowPicker] = useState(false);
  const locRef = useRef(null);
  useEffect(() => {
    const handler = e => {
      if (locRef.current && !locRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const cityLabel = city ? city + ' · ' + radius + ' km' : 'Cela Srbija';
  const applyLocation = (c, r) => {
    onCityChange && onCityChange(c, r);
    setShowPicker(false);
  };
  const handleSubmit = e => {
    e.preventDefault();
    onCityChange && onCityChange(city, radius);
    onSearch(q, mode);
  };
  return /*#__PURE__*/React.createElement("section", {
    className: 'hero layout-' + layout
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero-inner"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", null, "Daj \u0161ta ne ", /*#__PURE__*/React.createElement("em", null, "koristi\u0161"), ".", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "amp"
  }, "\u2014"), " Uzmi \u0161ta ti ", /*#__PURE__*/React.createElement("em", null, "treba"), "."), /*#__PURE__*/React.createElement("p", {
    className: "lede"
  }, "Pove\u017Ei se sa ljudima na druga\u010Diji na\u010Din. Razmeni, kupi ili prodaj predmete \u2014 bez agencija, bez naknada, bez komplikacija."), /*#__PURE__*/React.createElement("div", {
    className: "search-tabs"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: 'search-tab' + (mode === 'find' ? ' active' : ''),
    onClick: () => setMode('find')
  }, "Tra\u017Eim predmet"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: 'search-tab' + (mode === 'offer' ? ' active' : ''),
    onClick: () => setMode('offer')
  }, "Nudim za zamenu")), /*#__PURE__*/React.createElement("form", {
    className: "hero-search",
    onSubmit: handleSubmit
  }, /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 18,
    stroke: 1.8
  }), /*#__PURE__*/React.createElement("input", {
    value: q,
    onChange: e => setQ(e.target.value),
    placeholder: mode === 'find' ? 'Koji predmet tražite?' : 'Šta nudite za zamenu?'
  })), /*#__PURE__*/React.createElement("div", {
    className: "divider"
  }), /*#__PURE__*/React.createElement("div", {
    className: "loc",
    ref: locRef,
    style: {
      position: 'relative',
      cursor: 'pointer',
      userSelect: 'none'
    },
    onClick: () => setShowPicker(p => !p)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "pin",
    size: 16
  }), /*#__PURE__*/React.createElement("span", null, cityLabel), /*#__PURE__*/React.createElement(Icon, {
    name: "caret",
    size: 11,
    style: {
      color: 'var(--ink-3)'
    }
  }), showPicker && /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: 'absolute',
      top: 'calc(100% + 10px)',
      left: 0,
      background: 'var(--bg, #fff)',
      border: '1px solid var(--line, #e5e7eb)',
      borderRadius: 12,
      padding: 16,
      minWidth: 230,
      boxShadow: '0 8px 28px rgba(0,0,0,0.13)',
      zIndex: 200
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'block',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.06em',
      color: 'var(--ink-3)',
      marginBottom: 6,
      textTransform: 'uppercase'
    }
  }, "Grad"), /*#__PURE__*/React.createElement("select", {
    value: city,
    onChange: e => setCity(e.target.value),
    style: {
      width: '100%',
      padding: '8px 10px',
      borderRadius: 8,
      border: '1px solid var(--line, #e5e7eb)',
      fontSize: 14,
      color: 'var(--ink-1)',
      background: 'var(--bg, #fff)',
      cursor: 'pointer',
      outline: 'none'
    }
  }, SERBIAN_CITIES.map(c => /*#__PURE__*/React.createElement("option", {
    key: c.id,
    value: c.id
  }, c.name)))), city && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'block',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.06em',
      color: 'var(--ink-3)',
      marginBottom: 8,
      textTransform: 'uppercase'
    }
  }, "Razdaljina"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6
    }
  }, [5, 10, 25, 50].map(r => /*#__PURE__*/React.createElement("button", {
    key: r,
    type: "button",
    onClick: () => setRadius(r),
    style: {
      flex: 1,
      padding: '7px 4px',
      borderRadius: 8,
      border: '1.5px solid ' + (radius === r ? 'var(--accent)' : 'var(--line, #e5e7eb)'),
      background: radius === r ? 'var(--accent)' : 'transparent',
      color: radius === r ? '#fff' : 'var(--ink-1)',
      fontSize: 12,
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all .15s'
    }
  }, r, " km")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, city && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => {
      setCity('');
      applyLocation('', radius);
    },
    style: {
      flex: 1,
      padding: '8px',
      borderRadius: 8,
      border: '1px solid var(--line)',
      background: 'transparent',
      color: 'var(--ink-2)',
      fontSize: 13,
      fontWeight: 500,
      cursor: 'pointer'
    }
  }, "Resetuj"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => applyLocation(city, radius),
    style: {
      flex: 2,
      padding: '8px',
      borderRadius: 8,
      background: 'var(--accent)',
      color: '#fff',
      border: 'none',
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer'
    }
  }, "Primeni")))), /*#__PURE__*/React.createElement("button", {
    className: "go",
    type: "submit"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 15,
    stroke: 2.2
  }), " Pretra\u017Ei")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '10px 0 0',
      fontSize: 13,
      color: 'var(--ink-3)',
      lineHeight: 1.5
    }
  }, "Prona\u0111i to \u0161ta tra\u017Ei\u0161, ili osobu koja tra\u017Ei \u0161ta ti nudi\u0161."), pendingOffers.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "hero-pending-strip"
  }, pendingOffers.slice(0, 3).map(o => /*#__PURE__*/React.createElement("div", {
    key: o.id,
    className: "hero-pending-item"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "swap",
    size: 15,
    style: {
      color: 'var(--accent)',
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "hero-pending-text"
  }, /*#__PURE__*/React.createElement("b", null, o.other_user), " \u017Eeli da zameni", o.listing ? /*#__PURE__*/React.createElement(React.Fragment, null, " tvoj oglas ", /*#__PURE__*/React.createElement("b", null, "\u201E", o.listing.title, "\"")) : '', o.offered_listing ? /*#__PURE__*/React.createElement(React.Fragment, null, " za ", /*#__PURE__*/React.createElement("b", null, "\u201E", o.offered_listing.title, "\"")) : ''), /*#__PURE__*/React.createElement("div", {
    className: "hero-pending-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "hero-pending-btn accept",
    onClick: () => onOfferRespond && onOfferRespond(o.id, 'accept')
  }, "Prihvati"), /*#__PURE__*/React.createElement("button", {
    className: "hero-pending-btn decline",
    onClick: () => onOfferRespond && onOfferRespond(o.id, 'decline')
  }, "Odbij")))))), layout === 'split' && /*#__PURE__*/React.createElement(HeroArt, {
    accent: accent
  })), layout === 'grid' && /*#__PURE__*/React.createElement("div", {
    className: "section-inner",
    style: {
      maxWidth: 1280,
      margin: '0 auto',
      padding: '0 24px 24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero-grid-strip"
  }, [1, 2, 3, 4, 5, 6].map(i => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "hgs"
  }, "slika ", i)))));
}

/* ─── TRUST STRIP ──────────────────────────────── */
function TrustStrip() {
  return /*#__PURE__*/React.createElement("div", {
    className: "trust"
  }, /*#__PURE__*/React.createElement("div", {
    className: "trust-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "t-i"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield",
    size: 16,
    style: {
      color: 'var(--accent)'
    }
  }), " ", /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "Verifikovani profili"), " \u2014 broj telefona obavezan")), /*#__PURE__*/React.createElement("div", {
    className: "t-i"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "leaf",
    size: 16,
    style: {
      color: 'var(--accent)'
    }
  }), " ", /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "23.840 razmena"), " ostvareno ove godine")), /*#__PURE__*/React.createElement("div", {
    className: "t-i"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "star",
    size: 16,
    style: {
      color: 'var(--accent)'
    }
  }), " ", /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "4.8/5"), " prose\u010Dna ocena zajednice")), /*#__PURE__*/React.createElement("div", {
    className: "t-i"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "pin",
    size: 16,
    style: {
      color: 'var(--accent)'
    }
  }), " ", /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "72 grada"), " u Srbiji aktivno"))));
}

/* ─── CATEGORIES ─────────────────────────────────── */
function Categories({
  categories = [],
  onSelect
}) {
  const displayCats = categories.filter(c => c.id !== 'sve');
  const scrollRef = useRef(null);
  const scroll = function (dir) {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir * 380,
      behavior: 'smooth'
    });
  };
  return /*#__PURE__*/React.createElement("section", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Pregledaj po kategoriji"), /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, displayCats.reduce((s, c) => s + (c.count || 0), 0).toLocaleString(), " aktivnih oglasa danas.")), /*#__PURE__*/React.createElement("div", {
    className: "link",
    onClick: () => onSelect('sve')
  }, "Sve kategorije ", /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-r",
    size: 14
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "cat-arr cat-arr-l",
    onClick: () => scroll(-1),
    "aria-label": "Prethodno"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-r",
    size: 16,
    style: {
      transform: 'rotate(180deg)',
      display: 'block'
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "cat-carousel",
    ref: scrollRef
  }, displayCats.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '32px 0',
      textAlign: 'center',
      color: 'var(--ink-3)',
      fontSize: 13,
      whiteSpace: 'nowrap'
    }
  }, "U\u010Ditavanje kategorija...") : displayCats.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.id,
    className: "cat-tile",
    onClick: () => onSelect(c.id)
  }, /*#__PURE__*/React.createElement("div", {
    className: "ic"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: c.icon || 'tag',
    size: 22,
    stroke: 1.5
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "nm"
  }, c.name), /*#__PURE__*/React.createElement("div", {
    className: "ct"
  }, (c.count || 0).toLocaleString(), " oglasa"))))), /*#__PURE__*/React.createElement("button", {
    className: "cat-arr cat-arr-r",
    onClick: () => scroll(1),
    "aria-label": "Slede\u0107e"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-r",
    size: 16,
    style: {
      display: 'block'
    }
  })))));
}

/* ─── LISTING CARD ─────────────────────────────── */
function relTime(iso) {
  if (!iso) return '';
  var diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 3600) return Math.floor(diff / 60) + ' min';
  if (diff < 86400) return Math.floor(diff / 3600) + ' h';
  if (diff < 86400 * 30) return 'pre ' + Math.floor(diff / 86400) + ' d';
  return 'pre ' + Math.floor(diff / (86400 * 30)) + ' mj';
}
function ListingCard({
  item,
  fav,
  onFav,
  onClick,
  onOpenProfile
}) {
  const isBarter = item.type === 'barter' || item.type === 'both';
  const isPremium = item.is_premium || item.is_featured;
  return /*#__PURE__*/React.createElement("div", {
    className: "card",
    onClick: onClick
  }, /*#__PURE__*/React.createElement("div", {
    className: "img"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ph"
  }, item.images && item.images.length > 0 ? /*#__PURE__*/React.createElement("img", {
    src: item.images[0].url,
    alt: item.title,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    loading: "lazy"
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--ink-3)',
      fontFamily: 'var(--font-mono)',
      textAlign: 'center',
      padding: '0 8px'
    }
  }, item.catName || '📦')), /*#__PURE__*/React.createElement("div", {
    className: "badges"
  }, isPremium && /*#__PURE__*/React.createElement("span", {
    className: "b",
    style: {
      background: '#1a365d',
      color: '#fff',
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      padding: '3px 7px',
      borderRadius: 5,
      fontWeight: 700,
      letterSpacing: '.05em'
    }
  }, "\u2605 PREMIUM"), isBarter && /*#__PURE__*/React.createElement("span", {
    className: "b barter"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "swap",
    size: 10,
    stroke: 2
  }), " Razmena")), /*#__PURE__*/React.createElement("button", {
    className: 'fav' + (fav ? ' on' : ''),
    onClick: e => {
      e.stopPropagation();
      onFav();
    },
    "aria-label": "Sa\u010Duvaj"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "heart",
    size: 15
  }))), /*#__PURE__*/React.createElement("div", {
    className: "body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "title"
  }, item.title), item.seek && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ink-3)',
      fontStyle: 'italic',
      marginBottom: 2
    }
  }, "\u21B3 ", item.seek), /*#__PURE__*/React.createElement("div", {
    className: "price"
  }, /*#__PURE__*/React.createElement("span", {
    className: 'p' + (isBarter && !item.price ? ' barter' : '')
  }, item.price ? parseFloat(item.price).toLocaleString('sr-RS') + ' RSD' : 'Razmena')), /*#__PURE__*/React.createElement("div", {
    className: "meta",
    style: {
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 3
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "pin",
    size: 11
  }), " ", item.city), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink-4)',
      fontFamily: 'var(--font-mono)',
      fontSize: 11
    }
  }, relTime(item.created))), item.user && /*#__PURE__*/React.createElement("div", {
    onClick: e => {
      e.stopPropagation();
      onOpenProfile && onOpenProfile(item.user);
    },
    style: {
      fontSize: 12,
      color: 'var(--ink-3)',
      marginTop: 4,
      cursor: onOpenProfile ? 'pointer' : 'default'
    }
  }, item.user)));
}

/* ─── HOW IT WORKS ─────────────────────────────── */
function HowItWorks() {
  const steps = [{
    n: '01',
    t: 'Postavi oglas',
    p: 'Slikaj predmet, opiši ga i reci šta tražiš — razmenu, novac ili oboje. Gotovo za manje od minuta.'
  }, {
    n: '02',
    t: 'Razmeni poruke',
    p: 'Neko je zainteresovan — piše ti direktno. Bez posrednika, samo vi dvoje.'
  }, {
    n: '03',
    t: 'Završi razmenu',
    p: 'Dogovorite se, nađite se, razmenite. Ocenite jedno drugo i gradite poverenje u zajednici.'
  }];
  return /*#__PURE__*/React.createElement("section", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Kako funkcioni\u0161e"), /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, "Tri koraka. Bez pretplata, bez provizija."))), /*#__PURE__*/React.createElement("div", {
    className: "how"
  }, steps.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.n,
    className: "step"
  }, /*#__PURE__*/React.createElement("div", {
    className: "num"
  }, s.n), /*#__PURE__*/React.createElement("h3", null, s.t), /*#__PURE__*/React.createElement("p", null, s.p))))));
}

/* ─── FOOTER ───────────────────────────────────── */
const FOOT_CATEGORIES = [['Elektronika', 'elektronika'], ['Vozila', 'vozila'], ['Moda', 'moda'], ['Dom', 'dom'], ['Sport', 'sport'], ['Deca', 'deca'], ['Nekretnine', 'nekretnine'], ['Bela tehnika', 'bela-tehnika'], ['Hobi', 'hobi'], ['Ljubimci', 'ljubimci']];
const FOOT_CITIES = [['Beograd', 'beograd'], ['Novi Sad', 'novi-sad'], ['Niš', 'nis'], ['Kragujevac', 'kragujevac'], ['Subotica', 'subotica'], ['Čačak', 'cacak']];
function Footer() {
  return /*#__PURE__*/React.createElement("footer", {
    className: "foot"
  }, /*#__PURE__*/React.createElement("nav", {
    className: "foot-seo",
    "aria-label": "Kategorije i gradovi"
  }, /*#__PURE__*/React.createElement("div", {
    className: "foot-col"
  }, /*#__PURE__*/React.createElement("h4", null, "Popularne kategorije"), /*#__PURE__*/React.createElement("div", {
    className: "foot-tags"
  }, FOOT_CATEGORIES.map(([name, slug]) => /*#__PURE__*/React.createElement("a", {
    key: slug,
    href: '/kategorija/' + slug + '/'
  }, name)))), /*#__PURE__*/React.createElement("div", {
    className: "foot-col"
  }, /*#__PURE__*/React.createElement("h4", null, "Pretraga po gradu"), /*#__PURE__*/React.createElement("div", {
    className: "foot-tags"
  }, FOOT_CITIES.map(([name, slug]) => /*#__PURE__*/React.createElement("a", {
    key: slug,
    href: '/grad/' + slug + '/'
  }, name))))), /*#__PURE__*/React.createElement("div", {
    className: "foot-inner"
  }, /*#__PURE__*/React.createElement("div", null, "\xA9 2026 Daj Zameni \xB7 Made in Serbia"), /*#__PURE__*/React.createElement("div", {
    className: "links"
  }, /*#__PURE__*/React.createElement("a", {
    href: "/o-nama/"
  }, "O nama"), /*#__PURE__*/React.createElement("a", {
    href: "/pravila/"
  }, "Pravila zajednice"), /*#__PURE__*/React.createElement("a", {
    href: "/privatnost/"
  }, "Privatnost"), /*#__PURE__*/React.createElement("a", {
    href: "/pomoc/"
  }, "Pomo\u0107"), /*#__PURE__*/React.createElement("a", null, "Kontakt"))));
}
Object.assign(window, {
  Nav,
  Hero,
  Categories,
  ListingCard,
  HowItWorks,
  Footer,
  NotificationsPopover,
  NotificationsDrawer
});